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

const productTypes = [
  'Smartphones', 'Tablets', 'Laptops', 'Smartwatches', 'Earbuds', 
  'Chargers', 'Power Banks', 'Screen Guards', 'Back Cases', 'Adapters'
];

const brands = {
  'Smartphones': ['Apple', 'Samsung', 'Google', 'OnePlus', 'Xiaomi'],
  'Tablets': ['Apple', 'Samsung', 'Microsoft', 'Lenovo'],
  'Laptops': ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS'],
  'Smartwatches': ['Apple', 'Samsung', 'Garmin', 'Fitbit'],
  'Earbuds': ['Apple', 'Sony', 'Bose', 'Samsung', 'Jabra'],
  'Chargers': ['Anker', 'Belkin', 'Apple', 'Samsung'],
  'Power Banks': ['Anker', 'RAVPower', 'Xiaomi', 'Samsung'],
  'Screen Guards': ['Spigen', 'Belkin', 'Zagg'],
  'Back Cases': ['Spigen', 'OtterBox', 'Apple', 'Samsung', 'Caseology'],
  'Adapters': ['Apple', 'Satechi', 'Anker']
};

const models = {
  'Smartphones': ['iPhone 15 Pro', 'Galaxy S24 Ultra', 'Pixel 8 Pro', 'OnePlus 12', 'Xiaomi 14'],
  'Tablets': ['iPad Pro M2', 'Galaxy Tab S9', 'Surface Pro 9', 'Tab P12'],
  'Laptops': ['MacBook Air M3', 'XPS 13', 'Spectre x360', 'ThinkPad X1 Carbon', 'ROG Zephyrus G14'],
  'Smartwatches': ['Apple Watch Ultra 2', 'Galaxy Watch 6', 'Fenix 7', 'Sense 2'],
  'Earbuds': ['AirPods Pro 2', 'WF-1000XM5', 'QuietComfort Ultra', 'Galaxy Buds2 Pro', 'Elite 10'],
  'Chargers': ['Nano II 65W', 'BoostCharge 30W', '20W USB-C Adapter', '45W PD Charger'],
  'Power Banks': ['PowerCore 26800', 'Turbo 20000', 'Mi Power Bank 3', 'Wireless Battery Pack'],
  'Screen Guards': ['Glas.tR EZ Fit', 'ScreenForce', 'InvisibleShield'],
  'Back Cases': ['Tough Armor', 'Defender Series', 'Silicone Case', 'Leather Case', 'Skyfall'],
  'Adapters': ['USB-C to Digital AV', 'Multiport Adapter', 'USB-C to Ethernet']
};

async function seed() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // 1. Drop and Recreate tables to ensure clean slate and correct names
    console.log('Resetting tables...');
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('DROP TABLE IF EXISTS order_items');
    await connection.query('DROP TABLE IF EXISTS products');
    await connection.query('DROP TABLE IF EXISTS product_types');
    await connection.query('DROP TABLE IF EXISTS device_types'); // Old table

    // Re-run the relevant parts of init.sql
    await connection.query(`
      CREATE TABLE product_types (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL
      )
    `);

    await connection.query(`
      CREATE TABLE products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        type_id INT NOT NULL,
        brand VARCHAR(150) NOT NULL,
        model VARCHAR(150) NOT NULL,
        description TEXT,
        image_ids TEXT,
        price DECIMAL(10, 2) DEFAULT 0.00,
        active BOOLEAN DEFAULT TRUE,
        active_by ENUM('admin', 'shopowner') DEFAULT 'admin',
        FOREIGN KEY (type_id) REFERENCES product_types(id)
      )
    `);

    await connection.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            id INT AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL,
            device_id INT NOT NULL,
            quantity INT NOT NULL DEFAULT 1,
            price_at_purchase DECIMAL(10, 2) NOT NULL,
            FOREIGN KEY (device_id) REFERENCES products(id) ON DELETE CASCADE
        )
    `);

    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    // 2. Insert Product Types
    console.log('Inserting product types...');
    const typeIdMap = {};
    for (const type of productTypes) {
      const [result] = await connection.query('INSERT INTO product_types (name) VALUES (?)', [type]);
      typeIdMap[type] = result.insertId;
    }

    // 3. Insert 100+ Products
    console.log('Inserting 100+ products...');
    let productCount = 0;
    for (const type of productTypes) {
      const typeBrands = brands[type];
      const typeModels = models[type];
      const typeId = typeIdMap[type];

      for (let i = 0; i < 11; i++) { // ~11 products per type * 10 types = 110 products
        const brand = typeBrands[Math.floor(Math.random() * typeBrands.length)];
        const modelBase = typeModels[Math.floor(Math.random() * typeModels.length)];
        const model = `${modelBase} ${i > 0 ? '(Gen ' + (i+1) + ')' : ''}`;
        const price = (Math.random() * (1500 - 10) + 10).toFixed(2);
        const description = `High-quality ${model} from ${brand}. Perfect for your ${type.toLowerCase()} needs. Features latest technology and durable design.`;
        
        await connection.query(
          'INSERT INTO products (type_id, brand, model, description, price) VALUES (?, ?, ?, ?, ?)',
          [typeId, brand, model, description, price]
        );
        productCount++;
      }
    }

    console.log(`Successfully seeded ${productCount} products across ${productTypes.length} categories.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seed();
