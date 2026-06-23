const { db } = require('./src/config');
async function check() {
  try {
    const [rows] = await db.execute("SELECT id, image_ids FROM products WHERE image_ids IS NOT NULL AND image_ids != ''");
    const invalid = rows.filter(r => r.image_ids.split(',').some(id => isNaN(parseInt(id.trim()))));
    console.log('Products with non-numeric image_ids:', invalid.length);
    if (invalid.length > 0) {
      console.log(JSON.stringify(invalid, null, 2));
    }
  } catch(e) {
    console.error('DB Error:', e.message);
  } finally {
    process.exit(0);
  }
}
check();
