const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const port = 3002;

app.use(bodyParser.json({ limit: '5mb', extended: true }));
app.use(cors())

const transactionServices = require('./transaction-service');

app.get('/', (req, res) => {
  res.send('Transacciones')
})

app.post('/transferencia', transactionServices.postTransferenciaBilleteras);
app.put('/retiro', transactionServices.putRetirarSaldo);
app.put('/recargar', transactionServices.putRecargar);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})