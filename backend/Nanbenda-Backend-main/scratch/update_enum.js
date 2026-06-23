const { db } = require('../src/config');

async function updateEnum() {
  try {
    await db.execute("ALTER TABLE repair_bookings MODIFY COLUMN status ENUM('pending', 'technician_assigned', 'on_the_way', 'reached', 'repaired', 'payment_done') DEFAULT 'pending'");
    console.log('Successfully added payment_done to repair_bookings status enum.');
    process.exit(0);
  } catch (err) {
    console.error('Failed to update enum:', err);
    process.exit(1);
  }
}

updateEnum();
