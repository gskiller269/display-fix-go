const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Use the credentials provided in system instructions
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'nanbenda',
  port: 3306
};

async function executeQuery(sql) {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows, fields] = await connection.execute(sql);
    console.log(JSON.stringify(rows, null, 2));
  } catch (error) {
    console.error('Error executing query:', error.message);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

const sqlArg = process.argv[2];
if (!sqlArg) {
  console.error('Please provide a SQL query as an argument.');
  process.exit(1);
}

executeQuery(sqlArg);
