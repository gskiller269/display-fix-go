const { db } = require('../src/config');

async function checkSchema() {
  try {
    const [rows] = await db.execute('DESCRIBE products');
    console.log('Products Schema:');
    rows.forEach(row => console.log(`${row.Field}: ${row.Type}`));
    process.exit(0);
  } catch (error) {
    console.error('Failed to describe products:', error.message);
    process.exit(1);
  }
}

checkSchema();
