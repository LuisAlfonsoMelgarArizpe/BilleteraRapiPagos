const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000
var mysql = require('mysql');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: "52.14.227.185",
  user: "root",
  password: "billetera",
  database: "billetera"
});


con.connect(function (err) {
  if (err) throw err;
  console.log("Conectado a la base de datos!");
});


app.get('/', (req, res) => {
  res.send('Billetera')
})


app.post('/login', (req, res) => {
  let usuario = req.body.usuario;
  let pass = req.body.pass;
  if (usuario == 'admin') {
    res.json({ mensaje: "Ok" })

  } else {
    res.json({ mensaje: "Error" })
  }

})


app.post('/registro', (req, res) => {
  let { usuario, pass } = req.body;
  res.json({ mensaje: "Usuario insertado con exito" })
})

app.get('/server', (req, res) => { 
  res.json({mensaje:"Servidor #1"})

})

app.get('/funcion',(req,res) => {
  numero = Math.round(Math.random(1,100) * 100)
  res.json({mensaje:numero})
})



app.post('/vincularTarjeta', (req, res) => {
  try {
    let id_usuario = req.body.id_usuario;
    let no_tarjeta = req.body.no_tarjeta;
    let nombre_tarjeta = req.body.nombre_tarjeta;
    let mes_vencimiento = req.body.mes_vencimiento;
    let ano_vencimiento = req.body.ano_vencimiento;
    let pin = req.body.pin;

    //Validar tarjeta
    let validar = true

    if (validar) {

      let sql = `INSERT INTO tarjeta(numero,mes_vencimiento,ano_vencimiento,cvv,usuario_id) VALUES('${no_tarjeta}',${mes_vencimiento},${ano_vencimiento},'${pin}',${id_usuario})`
      con.query(sql, function (err, result) {
        if (err) throw err;
        res.status(200).json({ mensaje: "Tarjeta vinculada con exito!" })
      });

    } else {
      res.status(200).json({ mensaje: "Tarjeta no encontrada/no validada!" })
    }

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.get('/obtenerTarjetasEnlazadas', (req, res) => {
  try {
    let telefono = req.query.telefono;

    let sql = `SELECT numero, mes_vencimiento, ano_vencimiento, cvv as 'pin' from tarjeta where usuario_id = (SELECT id FROM usuario WHERE telefono = '${telefono}');`;

    con.query(sql, function (err, result) {
      if (err) {

        res.status(400).json({ mensaje: err.sqlMessage })

      } else {
        if (result.length <= 0) {
          res.status(404).json({ mensaje: "No existen tarjetas asociadas a ese numero de telefono." })
        } else {
          res.status(200).json(result)
        }
      }
    });

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})


app.get('/obtenerSaldo', (req, res) => {
  try {
    let telefono = req.query.telefono;

    let sql = `SELECT saldo FROM usuario WHERE telefono = ${telefono}`
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.json({ saldo: result[0].saldo })
      } else {
        res.status(404).json({ mensaje: "No existe ninguna billetera asociada al numero de telefono solicitado." })
      }
    });

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})


app.post('/enlazarBilletera', (req, res) => {
  try {

    let numeroPrincipal = req.body.numeroPrincipal;
    let numeroTercero = req.body.numeroTercero;

    let sql = `INSERT INTO amistad(solicitante_id,amigo_id) VALUES ((SELECT id FROM usuario WHERE telefono = ${numeroPrincipal}),(SELECT id FROM usuario WHERE telefono = ${numeroTercero}));`
    con.query(sql, function (err, result) {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(400).json({ mensaje: "Estas billeteras ya estan vinculadas." })
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          res.status(404).json({ mensaje: "Alguno de los numeros ingresados no existe." })
        } else {
          res.status(400).json({ mensaje: err.sqlMessage })
        }
      } else {

        res.json({ mensaje: "Vinculacion exitosa!" })
      }
    });
  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})


app.get('/obtenerBilleterasEnlazadas', (req, res) => {
  try {
    let telefono = req.query.telefono;

    let sql = `SELECT u2.telefono, u2.nombre FROM amistad a INNER JOIN usuario u ON u.id = a.solicitante_id INNER JOIN usuario u2 ON u2.id = a.amigo_id WHERE u.telefono = ${telefono}`;

    con.query(sql, function (err, result) {
      if (err) {

        res.status(400).json({ mensaje: err.sqlMessage })

      } else {
        if (result.length <= 0) {
          res.status(404).json({ mensaje: "No existen billeteras asociadas a ese numero de telefono." })
        } else {
          res.status(200).json(result)
        }
      }
    });

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.post('/cambioEstado', (req, res) => {
  try {
    let telefono = req.query.telefono;
    let estado = req.query.estado;

    let sql = `UPDATE usuario SET estado = ${estado} WHERE telefono = ${telefono}`;

    con.query(sql, function (err, result) {
      if (err) {

        res.status(400).json({ mensaje: err.sqlMessage })

      } else {
        if (result.length <= 0) {
          res.status(404).json({ mensaje: "No existen billeteras asociadas a ese numero de telefono." })
        } else {
          res.status(200).json({ mensaje: "Se cambio el estado de el usuario." })
        }
      }
    });

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' });
  }
})

app.post('/vincularContadorLuz', (req, res) => {
  try {

    let contador = req.body.contador;
    let telefono = req.body.telefono;

    let sql = `INSERT INTO contador (tipo,numero,usuario_id) VALUES (1,'${contador}',(SELECT id FROM usuario WHERE telefono = '${telefono}'))`
    con.query(sql, function (err, result) {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(400).json({ mensaje: "El contador ya esta vinculado al usuario." })
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          res.status(404).json({ mensaje: "El numero de telefono no existe." })
        } else {
          res.status(400).json({ mensaje: err.sqlMessage })
        }
      } else {

        res.json({ mensaje: "Vinculacion exitosa!" })
      }
    });
  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.post('/vincularContadorAgua', (req, res) => {
  try {

    let contador = req.body.contador;
    let telefono = req.body.telefono;

    let sql = `INSERT INTO contador (tipo,numero,usuario_id) VALUES (2,'${contador}',(SELECT id FROM usuario WHERE telefono = '${telefono}'))`
    con.query(sql, function (err, result) {
      if (err) {
        if (err.code == "ER_DUP_ENTRY") {
          res.status(400).json({ mensaje: "El contador ya esta vinculado al usuario." })
        } else if (err.code == "ER_BAD_NULL_ERROR") {
          res.status(404).json({ mensaje: "El numero de telefono no existe." })
        } else {
          res.status(400).json({ mensaje: err.sqlMessage })
        }
      } else {

        res.json({ mensaje: "Vinculacion exitosa!" })
      }
    });
  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})


app.get('/contadoresEnlazados', (req, res) => {
  try {

    let tipo = req.query.tipo;
    let telefono = req.query.telefono;

    let sql = `SELECT numero FROM contador where tipo = ${tipo} and usuario_id = (SELECT id FROM usuario WHERE telefono = '${telefono}');`
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.json(result)
      } else {
        res.status(404).json({ mensaje: "No existe ningun contador enlazado a este numero de telefono." })
      }
    });
  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.get('/obtenerSaldoLuz', (req, res) => {
  try {

    let contador = req.query.contador;
    let valido = true;
    if (valido) {
      let saldo = 100;
      res.json({ saldo: saldo })

    } else {
      res.status(400).json("Error que viene desde el servicio de luz")
    }

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.get('/obtenerSaldoAgua', (req, res) => {
  try {

    let contador = req.query.contador;
    let valido = true;
    if (valido) {
      let saldo = 100;
      res.json({ saldo: saldo })

    } else {
      res.status(400).json("Error que viene desde el servicio de agua")
    }

  } catch {
    res.status(400).json({ mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})