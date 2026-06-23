const db = require('./src/config/database');

async function checkTables() {
  try {
    const [shops] = await db.execute('DESCRIBE shops');
    console.log('--- shops ---');
    console.table(shops);

    const [images] = await db.execute('DESCRIBE images');
    console.log('--- images ---');
    console.table(images);
  } catch (error) {
    console.error(error);
  } finally {
    process.exit();
  }
}

checkTables();
