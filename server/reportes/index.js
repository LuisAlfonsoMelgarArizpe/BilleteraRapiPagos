const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.json({ limit: '5mb', extended: true }));
app.use(cors())

const transactionServices = require('./reportes-service');

app.get('/', (req, res) => {
  res.send('Reportes')
})

app.get('/reportetotal', transactionServices.getTransacciones);
app.get('/reporte', transactionServices.getTransaccion)

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
})