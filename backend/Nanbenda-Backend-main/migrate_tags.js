const { db } = require('./src/config');

async function migrate() {
  try {
    console.log('Migrating products table to include tags...');
    await db.execute('ALTER TABLE products ADD COLUMN tags TEXT');

    console.log('Migration successful: tags column added.');
  } catch (err) {
    if (err.code === 'ER_DUP_COLUMN_NAME') {
      console.log('Migration skipped: tags column already exists.');
    } else {
      console.error('Migration failed:', err);
    }
  } finally {
    process.exit();
  }
}

migrate();
