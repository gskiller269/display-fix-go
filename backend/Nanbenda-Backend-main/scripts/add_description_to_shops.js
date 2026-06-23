const { db } = require('../src/config');

async function run() {
  try {
    console.log('Adding description column to shops table...');
    await db.execute('ALTER TABLE shops ADD COLUMN description TEXT DEFAULT NULL AFTER shop_name');
    console.log('Column added successfully.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', err);
    }
  } finally {
    process.exit();
  }
}

run();
