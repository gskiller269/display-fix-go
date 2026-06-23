const mysql = require('mysql2');
require('dotenv').config();

async function checkTables() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 3306
  });

  const db = pool.promise();

  try {
    const [rows] = await db.execute('SHOW TABLES');
    console.log('Tables in database:', rows);
    
    for (const row of rows) {
      const tableName = Object.values(row)[0];
      if (tableName === 'banners') {
        const [columns] = await db.execute(`DESCRIBE banners`);
        console.log('Columns in banners table:', columns);
      }
    }

  } catch (error) {
    console.error('Error checking tables:', error);
  } finally {
    await pool.end();
  }
}

checkTables();
