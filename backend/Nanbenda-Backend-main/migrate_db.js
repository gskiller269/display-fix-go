const { db } = require('./src/config');

async function migrate() {
  try {
    console.log('Adding latitude and longitude to addresses table...');
    await db.execute('ALTER TABLE addresses ADD COLUMN latitude DECIMAL(10, 8) DEFAULT NULL, ADD COLUMN longitude DECIMAL(11, 8) DEFAULT NULL');
    console.log('Success!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();
