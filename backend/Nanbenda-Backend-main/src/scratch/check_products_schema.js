const { db } = require('../config');

async function checkProducts() {
  try {
    const [cols] = await db.execute('SHOW COLUMNS FROM products');
    console.log('Products columns:', cols.map(c => c.Field));
    process.exit(0);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

checkProducts();
