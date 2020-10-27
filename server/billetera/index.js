const express = require('express')
var bodyParser = require('body-parser')
const app = express()
const port = 3000
var mysql = require('mysql');


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())


var con = mysql.createConnection({
  host: "13.59.43.121",
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
        res.json({ estado: 1, mensaje: "Tarjeta vinculada con exito!" })
      });

    } else {
      res.json({ estado: 2, mensaje: "Tarjeta no encontrada/no validada!" })
    }

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
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
      }else{
        res.status(400).json({ error: '400', mensaje:"No existe ninguna billetera asociada al numero de telefono solicitado." })
      }
    });

  } catch {
    res.status(400).json({ error: '400', mensaje: 'Error en el request, datos inválidos.' })
  }
})



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})