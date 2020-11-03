const db = require('./conn')


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
        res.status(200).json({ result: ':)' })
    } catch (error) {
        res.status(500).json({ mensaje: error })
    }

}

module.exports = { postTransferenciaBilleteras }