const { db } = require('./src/config');

async function migrate() {
  try {
    console.log('Running migration...');
    await db.query('ALTER TABLE product_types ADD COLUMN image_id INT');
    await db.query('ALTER TABLE product_types ADD CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id)');
    console.log('Migration successful');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();
