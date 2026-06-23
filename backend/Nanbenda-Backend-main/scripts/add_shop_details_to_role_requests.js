const { db } = require('../src/config');

async function run() {
  try {
    console.log('Adding shop_details column to role_requests table...');
    await db.execute('ALTER TABLE role_requests ADD COLUMN shop_details JSON DEFAULT NULL AFTER message');
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
