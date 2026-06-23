const { db } = require('./src/config');

async function migrate() {
  try {
    console.log('Creating images table and updating role_requests...');
    
    await db.execute(`
      CREATE TABLE IF NOT EXISTS images (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image_url TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    await db.execute(`
      ALTER TABLE role_requests 
      ADD COLUMN aadhar_image_id INT DEFAULT NULL,
      ADD COLUMN shop_doc_image_id INT DEFAULT NULL
    `);
    
    console.log('Success!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e.message);
    process.exit(1);
  }
}

migrate();
