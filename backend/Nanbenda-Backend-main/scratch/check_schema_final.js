const { db } = require('../src/config');

async function checkSchema() {
  try {
    const [ordersCols] = await db.execute('SHOW COLUMNS FROM orders');
    console.log('Orders Columns:', ordersCols.map(c => c.Field));
    
    const [repairCols] = await db.execute('SHOW COLUMNS FROM repair_bookings');
    console.log('Repair Bookings Columns:', repairCols.map(c => c.Field));
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSchema();
