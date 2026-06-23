const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nanbenda',
  port: parseInt(process.env.DB_PORT) || 3306,
  multipleStatements: true // Enabling this specifically for the init script
};

async function initDatabase() {
  let connection;
  try {
    console.log('Connecting to MySQL server...');
    // Initial connection without database to ensure it exists
    const initialConfig = { ...dbConfig, database: undefined };
    connection = await mysql.createConnection(initialConfig);
    
    console.log(`Ensuring database "${dbConfig.database}" exists...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
    await connection.query(`USE \`${dbConfig.database}\``);
    console.log('Database ready.');

    const sqlPath = path.join(__dirname, 'init.sql');
    console.log(`Reading SQL file from: ${sqlPath}`);
    const sql = await fs.readFile(sqlPath, 'utf8');

    console.log('Executing SQL initialization script...');
    // Disable foreign key checks to avoid issues with table creation order
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query(sql);
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('Database initialization completed successfully!');
  } catch (error) {
    console.error('Error during database initialization:');
    console.error(error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed.');
    }
  }
}

initDatabase();
