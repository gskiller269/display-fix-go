const { db } = require('./src/config');

async function checkSchema() {
  try {
    const [addrCols] = await db.execute('SHOW COLUMNS FROM addresses');
    console.log('Addresses columns:', addrCols.map(c => c.Field));
    
    const [repairCols] = await db.execute('SHOW COLUMNS FROM repair_bookings');
    console.log('Repairs columns:', repairCols.map(c => c.Field));
    
    process.exit(0);
  } catch (e) {
    console.error('Error checking schema:', e.message);
    process.exit(1);
  }
}

checkSchema();
