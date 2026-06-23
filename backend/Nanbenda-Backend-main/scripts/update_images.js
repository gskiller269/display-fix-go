const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'nanbenda',
  port: process.env.DB_PORT || 3306,
};

async function updateImages() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // 1. Remove all rows from images table
    console.log('Clearing images table...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DELETE FROM images');
    await connection.query('ALTER TABLE images AUTO_INCREMENT = 1');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Add the new image
    console.log('Adding new test image...');
    const imageUrl = 'https://vasanthandco.in/UploadedFiles/productimages/20251022012320-71BiI-RQ--L-_SL1500_.jpg';
    const [result] = await connection.query(
      'INSERT INTO images (name, image_url) VALUES (?, ?)',
      ['test', imageUrl]
    );
    const newImageId = result.insertId;
    console.log(`New image added with ID: ${newImageId}`);

    // 3. Update all products with 4 image IDs (e.g., "1,1,1,1")
    console.log('Updating all products with the new image IDs...');
    const imageIdsString = `${newImageId},${newImageId},${newImageId},${newImageId}`;
    const [updateResult] = await connection.query(
      'UPDATE products SET image_ids = ?',
      [imageIdsString]
    );
    console.log(`Updated ${updateResult.affectedRows} products.`);

    console.log('Successfully completed image update.');

  } catch (error) {
    console.error('Error during update:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateImages();
