const { db } = require('../src/config');
const RepairService = require('../src/services/repair.service');

async function testAssignment() {
  try {
    // 1. Update address 2 with coordinates
    await db.execute('UPDATE addresses SET latitude=11.38, longitude=77.89 WHERE id=2');
    console.log('Updated address 2 coordinates.');

    // 2. Mock a repair booking
    const userId = 1;
    const repairData = {
      device_brand: 'Apple',
      device_model: 'iPhone 13',
      problem_type: 'Screen Crack',
      problem_description: 'Test booking',
      address_id: 2,
      latitude: 11.38, // Explicitly pass from "frontend"
      longitude: 77.89
    };

    console.log('Creating repair booking...');
    const result = await RepairService.createRepair(userId, repairData);
    console.log('Booking created:', result);

    // 3. Verify in database
    const [rows] = await db.execute('SELECT * FROM repair_bookings WHERE id = ?', [result.id]);
    console.log('Database Record:', rows[0]);

    if (rows[0].shop_id) {
      console.log('SUCCESS: Shop ID assigned:', rows[0].shop_id);
    } else {
      console.error('FAILURE: Shop ID is null!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testAssignment();
