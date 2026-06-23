const { db } = require('../src/config');

async function setup() {
  try {
    console.log("Checking products table...");
    const [columns] = await db.execute("SHOW COLUMNS FROM products LIKE 'clicks'");
    
    if (columns.length === 0) {
      console.log("Adding 'clicks' column to products table...");
      await db.execute("ALTER TABLE products ADD COLUMN clicks INT DEFAULT 0");
      console.log("'clicks' column added successfully.");
    } else {
      console.log("'clicks' column already exists.");
    }
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    process.exit();
  }
}

setup();
