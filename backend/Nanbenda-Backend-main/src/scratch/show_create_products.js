const { db } = require('../config');

async function showCreate() {
  try {
    const [rows] = await db.execute('SHOW CREATE TABLE products');
    console.log(rows[0]['Create Table']);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

showCreate();
