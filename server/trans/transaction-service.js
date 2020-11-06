const db = require('./conn');
const axios = require('axios').default;

const postTransferenciaBilleteras = async (req, res) => {
    try {
        const body = req.body;
        const origen = await db.query(`SELECT id, saldo FROM usuario WHERE telefono = ${body.telefono_origen}`);
        const destino = await db.query(`SELECT id, saldo FROM usuario WHERE telefono = ${body.telefono_destino}`);
        if (origen.length == 0 || destino.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono no válido.' });
            return;
        }
        const amistad = await db.query(`SELECT * FROM amistad WHERE solicitante_id = ${origen[0].id} AND amigo_id = ${destino[0].id}`);
        if (amistad.length == 0) {
            res.status(400).json({ mensaje: 'Billetera no enlazada.' });
            return;
        }
        if (body.monto > origen[0].saldo) {
            res.status(400).json({ mensaje: 'No tiene fondos para realizar la transacción.' });
            return;
        }
        await db.query(`UPDATE usuario SET saldo = ${origen[0].saldo - body.monto} WHERE id = ${origen[0].id}`);
        await db.query(`UPDATE usuario SET saldo = ${destino[0].saldo + body.monto} WHERE id = ${destino[0].id}`);
        await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (2, ${body.monto}, 'Transferencia a ${body.telefono_destino}', NOW(), ${origen[0].id})`);
        await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (3, ${body.monto}, 'Transferencia desde ${body.telefono_origen}', NOW(), ${destino[0].id})`);
        res.status(200).json({ result: 'OK' })
    } catch (error) {
        res.status(500).json({ mensaje: error })
    }

}

const putRetirarSaldo = async (req, res) => {
    const body = req.body
    try {
        const usuario = await db.query(`SELECT id, saldo FROM usuario WHERE telefono = ${body.telefono}`);
        if (usuario.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono inválido.' });
            return;
        }
        if (usuario[0].saldo < body.monto) {
            res.status(400).json({ mensaje: 'No se tienen los fondos necesarios para realizar esta transacción.' });
            return;
        }
        await db.query(`UPDATE usuario SET saldo = ${usuario[0].saldo - body.monto} WHERE id = ${usuario[0].id}`);
        await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (1, ${body.monto}, 'Retiro', NOW(), ${usuario[0].id})`)
        res.status(200).json({ mensaje: 'OK' });
    } catch (error) {
        res.status(500).json({ mensaje: error });
    }
};

const putRecargar = async (req, res) => {
    const body = req.body
    try {
        const usuario = await db.query(`SELECT id, saldo FROM usuario WHERE telefono = ${body.telefono}`);
        if (usuario.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono inválido.' });
            return;
        }
        const tarjeta = await db.query(`SELECT id, numero FROM tarjeta WHERE numero = '${body.numero}' AND usuario_id = ${usuario[0].id}`)
        if (tarjeta.length == 0) {
            res.status(400).json({ mensaje: 'Número de tarjeta inválido.' });
            return;
        }
        //REALIZAR LA RECARGA
        const resp = await axios.post('http://35.238.13.44/debito', { numeroTarjeta: parseInt(tarjeta[0].numero), monto: body.monto });
        if (resp.data.estado) {
            await db.query(`UPDATE usuario SET saldo = ${usuario[0].saldo + body.monto} WHERE id = ${usuario[0].id}`)
            await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (0, ${body.monto}, 'Recarga desde ${body.numero.replace(/^.{3}/g, 'XXX')}', NOW(), ${usuario[0].id})`);
            res.status(200).json({ mensaje: 'OK' });
        } else {
            res.status(400).json({ mensaje: 'Tarjeta inválida.' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: error });
    }
};

const getCuentasLuzPendientes = async (req, res) => {
    const telefono = req.query.telefono;
    try {
        const usuario = await db.query(`SELECT id FROM usuario WHERE telefono = ${telefono}`);
        if (usuario.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono inválido.' });
            return;
        }
        const contadores = await db.query(`SELECT id, numero FROM contador WHERE usuario_id = ${usuario[0].id}`);
        var lista = [];
        for (var i = 0; i < contadores.length; i++) {
            const resp = await axios.get(`http://35.192.213.250:4000/Pago/informacion?id_contador=${contadores[i].numero}`);
            lista.push({
                id: contadores[i].id,
                numero: contadores[i].numero,
                telefono: parseInt(telefono),
                debe: resp.data.debe,
                pago: resp.data.pago,
                mora: resp.data.mora
            })
        }
        res.status(200).json(lista);
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: error });
    }
};

const pagoLuz = async (req, res) => {
    const body = req.body;
    try {
        const result = await db.query(`SELECT DISTINCT usuario.id, usuario.saldo, contador.numero FROM usuario INNER JOIN contador ON usuario.id = contador.usuario_id WHERE telefono = ${body.telefono} AND numero = '${body.contador}' AND tipo = 1`);
        if (result.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono o contador incorrecto.' });
            return;
        }
        const info = await axios.get(`http://35.192.213.250:4000/Pago/informacion?id_contador=${result[0].numero}`);
        var total = info.data.debe + info.data.debe * 0.05;
        total = total.toFixed(2);
        if (total > result[0].saldo) {
            res.status(400).json({ mensaje: 'La cuenta no posee los fondos para realizar la transacción.' });
            return;
        }
        const trans = await axios.post(`http://35.192.213.250:4000/Pago/pagar`, {
            "id_contador": parseInt(result[0].numero),
            "total": info.data.debe
        });
        if (trans.data.estado != 0) {
            res.status(400).json({ mensaje: trans.data.msg });
            return;
        }
        await db.query(`UPDATE usuario SET saldo = ${result[0].saldo - total} WHERE id = ${result[0].id}`);
        await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (4, ${total}, 'Pago de luz al contador: ${result[0].numero}', NOW(), ${result[0].id})`);
        res.status(200).json({ mensaje: 'OK' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: error });
    }
};

const pagoAgua = async (req, res) => {
    const body = req.body;
    try {
        const result = await db.query(`SELECT DISTINCT usuario.id, usuario.saldo, contador.numero FROM usuario INNER JOIN contador ON usuario.id = contador.usuario_id WHERE telefono = ${body.telefono} AND numero = '${body.contador}' AND tipo = 2`);
        if (result.length == 0) {
            res.status(400).json({ mensaje: 'Teléfono o contador incorrecto.' });
            return;
        }
        const info = await axios.post(`http://54.198.2.148:3000/contador/saldo`, { id: result[0].numero });
        if (!info.data.success) {
            res.status(400).json({ mensaje: info.data.message });
            return;
        }
        let pago = info.data.message;
        let total = pago + pago * 0.05;
        total = total.toFixed(2);
        if (total > result[0].saldo) {
            res.status(400).json({ mensaje: 'La cuenta no posee los fondos para realizar la transacción.' });
            return;
        }
        const trans = await axios.put(`http://54.198.2.148:3000/contador`, { id: result[0].numero });
        if (!trans.data.success) {
            res.status(400).json({ mensaje: trans.data.message });
            return;
        }
        await db.query(`UPDATE usuario SET saldo = ${result[0].saldo - total} WHERE id = ${result[0].id}`);
        await db.query(`INSERT INTO transaccion(tipo, monto, descripcion, fecha, usuario_id) VALUES (5, ${total}, 'Pago de agua al contador: ${result[0].numero}', NOW(), ${result[0].id})`);
        res.status(200).json({ mensaje: 'OK' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ mensaje: error });
    }
};

module.exports = { postTransferenciaBilleteras, putRetirarSaldo, putRecargar, getCuentasLuzPendientes, pagoLuz, pagoAgua };