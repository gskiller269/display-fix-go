const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'ajaysaagar',
  password: 'aass209c',
  database: 'fixmart'
};

const brands = ['Apple', 'Google', 'OnePlus', 'Xiaomi', 'Sony', 'Oppo', 'Vivo', 'Realme', 'Asus', 'Motorola'];
const models = ['Pro Max', 'Pixel 9', '12R', 'Redmi Note 14', 'Xperia 1 VI', 'Reno 12', 'V40 Pro', 'GT 6', 'ROG Phone 8', 'Edge 50 Ultra'];
const storageOptions = ['128GB', '256GB', '512GB', '1TB'];
const ramOptions = ['8GB', '12GB', '16GB'];

async function updateProducts() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // Get the IDs of the 50 products we just inserted (ordered by ID desc)
    const [rows] = await connection.execute('SELECT id FROM products ORDER BY id DESC LIMIT 50');
    
    if (rows.length === 0) {
      console.log('No products found to update.');
      return;
    }

    console.log(`Updating ${rows.length} products...`);

    for (let i = 0; i < rows.length; i++) {
      const brand = brands[i % brands.length];
      const modelBase = models[i % models.length];
      const ram = ramOptions[i % ramOptions.length];
      const storage = storageOptions[i % storageOptions.length];
      const modelName = `${modelBase} ${i + 1}`;
      const price = 49999 + (i * 1234);
      const description = `${brand} ${modelName} - Premium ${brand} device with ${ram} RAM and ${storage} storage. Exceptional performance and camera.`;
      const specs = `${ram} RAM, ${storage} Storage, Advanced Camera System`;

      await connection.execute(
        'UPDATE products SET brand = ?, model = ?, description = ?, price = ?, technical_specifications = ?, tags = ? WHERE id = ?',
        [brand, modelName, description, price, specs, specs, rows[i].id]
      );
    }

    console.log('Successfully updated 50 products with diverse data.');

  } catch (error) {
    console.error('Error updating products:', error);
  } finally {
    if (connection) await connection.end();
  }
}

updateProducts();
