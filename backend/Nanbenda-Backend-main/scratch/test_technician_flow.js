const { db } = require('../src/config');
const RepairService = require('../src/services/repair.service');

async function testTechnicianFlow() {
  try {
    const techId = 15;
    const repairId = 7;

    console.log(`Assigning technician ${techId} to repair ${repairId}...`);
    // Simulating shop owner assignment
    await db.execute('UPDATE repair_bookings SET technician_id = ?, status = ? WHERE id = ?', [techId, 'technician_assigned', repairId]);
    
    console.log('Fetching repairs for technician 15...');
    const repairs = await RepairService.getTechnicianRepairs(techId);
    console.log('Technician Repairs:', repairs);

    if (repairs.length > 0 && repairs[0].id === repairId) {
      console.log('SUCCESS: Technician correctly retrieved assigned job.');
      console.log('Customer Details in Job:', {
        name: repairs[0].customer_name,
        contact: repairs[0].mobile_number,
        address: repairs[0].address_line1,
        landmark: repairs[0].landmark
      });
    } else {
      console.error('FAILURE: Job not found for technician!');
    }

    process.exit(0);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
}

testTechnicianFlow();
