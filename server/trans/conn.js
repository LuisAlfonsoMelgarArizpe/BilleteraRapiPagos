const mysql = require("mysql");
const util = require("util");

// Create a connection to the database
const connection = mysql.createConnection({
  host: '52.14.227.185',
  user: 'root',
  password: 'billetera',
  database: 'billetera'
});

// open the MySQL connection
connection.connect(error => {
  if (error) throw error;
  console.log("Successfully connected to the database.");
});

connection.query = util.promisify(connection.query);

module.exports = connection;