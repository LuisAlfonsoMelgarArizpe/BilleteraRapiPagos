const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000
var mysql = require('mysql');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var con = mysql.createConnection({
  host: "localhost",
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

app.get('/inicioSesion', (req, res) => {
  try {
    let telefono = req.query.telefono;
    let contrasena = req.query.contrasena;

    let sql = `SELECT telefono, nombre, correo, dpi FROM usuario WHERE telefono = ${telefono} and contrasena = '${contrasena}'`
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.json({ saldo: result[0].saldo, nombre: result[0].nombre, correo: result[0].correo, dpi: result[0].dpi })
      }else{
        res.status(400).json({ error: '400', mensaje:"Usuario y contrasena no coinciden." })
      }
    });

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
  }
})


app.post('/usuario', (req, res) => {
  try {
    let telefono = req.body.telefono;
    let contrasena = req.body.contrasena;
    let imagen = req.body.imagen;
    let fecha_nacimiento = req.body.fecha_nacimiento;
    let dpi = req.body.dpi;
    let nombre = req.body.nombre;
    let correo = req.body.correo;

    //Validar usuario
    let validar = true
    
    let token  =  Math.floor(Math.random()*(999999999-100+1)+1000000000);
    if (validar) {

      let sql = `INSERT INTO usuario(telefono,contrasena,nombre,dpi,nacimiento,correo,imagen_dpi,saldo,estado,token) VALUES(${telefono}, '${contrasena}', '${nombre}', '${dpi}', '${fecha_nacimiento}', '${correo}', '${imagen}', 0, 1, '${token}')`
      con.query(sql, function (err, result) {
        if (err) throw err;
        res.json({ estado: 1, mensaje: "Usuario registrado con exito!" })
      });

    } else {
      res.json({ estado: 2, mensaje: "Parametros incorrectos!" })
    }

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.get('/validarUsuario', (req, res) => {
  try {
    let telefono = req.query.telefono;
    let token = req.query.token;

    let sql = `SELECT telefono FROM usuario WHERE telefono = ${telefono} and token = '${token}'`
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        let sql = `UPDATE usuario SET estado=2 WHERE telefono = ${telefono} and token = '${token}'`
        con.query(sql, function (err, result) {
          if (err) throw err;
          res.json({ estado: 1, mensaje: "Usuario validado con exito!" })
        });
      }else{
        res.status(400).json({ error: '400', mensaje:"Token incorrecto." })
      }
    });

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
  }
})

app.get('/obtenerUsuario', (req, res) => {
  try {
    let telefono = req.query.telefono;

    let sql = `SELECT telefono, nombre, nacimiento, dpi, correo, estado  FROM usuario WHERE telefono = ${telefono}`
    con.query(sql, function (err, result) {
      if (err) throw err;
      if (result.length > 0) {
        res.json({ telefono: result[0].telefono, nombre: result[0].nombre, nacimiento: result[0].nacimiento, dpi: result[0].dpi, correo: result[0].correo, estado: result[0].estado })
      }else{
        res.status(400).json({ error: '400', mensaje:"No existe un usuario con ese numero de telefono" })
      }
    });

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
  }
})