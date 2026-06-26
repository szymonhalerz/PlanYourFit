const mysql = require('mysql2/promise');
const { db } = require('../config');

const pool = mysql.createPool({
  ...db,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
  decimalNumbers: true,
});

module.exports = pool;
