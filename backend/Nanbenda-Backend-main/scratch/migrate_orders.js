const { db } = require('../src/config');

async function migrate() {
  try {
    console.log('Adding shop_id to orders table...');
    await db.execute(`
      ALTER TABLE orders 
      ADD COLUMN shop_id INT AFTER address_id,
      ADD CONSTRAINT fk_orders_shop FOREIGN KEY (shop_id) REFERENCES shops(id) ON DELETE SET NULL
    `);
    console.log('Migration successful: shop_id added to orders table.');
    process.exit(0);
  } catch (error) {
    if (error.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Migration skipped: shop_id already exists in orders table.');
      process.exit(0);
    }
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
