const db = require('./conn')


const getTransacciones = async (req, res) => {
    try {
        const result = await db.query(`
        select telefono, nombre, tipo, monto, descripcion, fecha
        from usuario inner join transaccion on usuario.id = transaccion.usuario_id
        order by fecha desc
        `);
        res.status(200).json(result)
    } catch (error) {
        res.status(500).json({ mensaje: error })
    }

}

const getTransaccion = async (req, res) => {
    try {
        const telefono = req.query.telefono;
        const result = await db.query(`
        select telefono, nombre, tipo, monto, descripcion, fecha
        from usuario inner join transaccion on usuario.id = transaccion.usuario_id
        where telefono = ${telefono}
        order by fecha desc
        `);
        if (result.length == 0) {
            res.status(400).json({mensaje: "Teléfono no registrado."});
            return;
        }
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ mensaje: error })
    }

}

module.exports = { getTransacciones, getTransaccion }