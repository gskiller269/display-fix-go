const { db } = require('../src/config');

async function checkSchema() {
  try {
    const [rows] = await db.execute('DESCRIBE addresses');
    console.log('Addresses Schema:');
    rows.forEach(row => console.log(`${row.Field}: ${row.Type}`));
    process.exit(0);
  } catch (error) {
    console.error('Failed to describe addresses:', error.message);
    process.exit(1);
  }
}

checkSchema();
