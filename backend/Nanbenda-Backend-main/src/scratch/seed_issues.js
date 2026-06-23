const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'ajaysaagar',
  password: 'aass209c',
  database: 'fixmart'
};

const issues = [
  [1, 'Cracked Screen', 'Screen glass is cracked or shattered due to accidental drop or pressure.'],
  [2, 'Broken Back Glass', 'Back panel glass is cracked or damaged from impact.'],
  [3, 'Water Damage', 'Device exposed to water or liquid causing internal component damage.'],
  [4, 'Battery Drain', 'Battery discharges quickly even under normal usage.'],
  [5, 'Battery Swelling', 'Battery expands physically and may push the screen or back cover outward.'],
  [6, 'Charging Port Damage', 'Charging connector is loose broken or not detecting charger properly.'],
  [7, 'Phone Not Charging', 'Device fails to charge when connected to power source.'],
  [8, 'Slow Charging', 'Charging speed is significantly slower than normal.'],
  [9, 'Overheating', 'Device becomes excessively hot during usage or charging.'],
  [10, 'Random Shutdown', 'Device powers off automatically without warning.'],
  [11, 'Black Screen', 'Display remains black even when the device is powered on.'],
  [12, 'Screen Flickering', 'Display brightness or image flickers continuously.'],
  [13, 'Touch Not Working', 'Touchscreen becomes partially or fully unresponsive.'],
  [14, 'Ghost Touch', 'Screen registers random touch inputs without user interaction.'],
  [15, 'Dead Pixels', 'Small areas of the display do not show proper colors or remain black.'],
  [16, 'Screen Burn In', 'Permanent image retention visible on OLED displays.'],
  [17, 'Speaker Not Working', 'Device speaker produces no sound or distorted sound.'],
  [18, 'Microphone Failure', 'Microphone does not capture voice properly.'],
  [19, 'Camera Blur', 'Camera captures blurry or unclear images.'],
  [20, 'Camera App Crash', 'Camera application closes unexpectedly or fails to open.'],
  [21, 'Flash Not Working', 'Camera flash fails to turn on or function correctly.'],
  [22, 'SIM Not Detected', 'Device cannot recognize inserted SIM card.'],
  [23, 'WiFi Connectivity Issue', 'Device fails to connect or maintain WiFi connection.'],
  [24, 'Bluetooth Issue', 'Bluetooth fails to pair or disconnects frequently.'],
  [25, 'GPS Failure', 'GPS location tracking does not work accurately.'],
  [26, 'Boot Loop', 'Device repeatedly restarts without entering the system.'],
  [27, 'System Lag', 'Device performance becomes slow and unresponsive.'],
  [28, 'App Crash', 'Applications close unexpectedly during use.'],
  [29, 'Storage Full', 'Device storage reaches capacity affecting performance.'],
  [30, 'Virus Malware', 'Malicious software affects device behavior and security.'],
  [31, 'Motherboard Failure', 'Main circuit board becomes damaged causing major hardware failure.'],
  [32, 'Fingerprint Sensor Failure', 'Fingerprint scanner does not detect or verify fingerprints.'],
  [33, 'Face Unlock Failure', 'Face recognition security feature stops functioning.'],
  [34, 'Vibration Motor Failure', 'Phone vibration feedback stops working.'],
  [35, 'Broken Laptop Screen', 'Laptop display panel is cracked or physically damaged.'],
  [36, 'Hinge Damage', 'Laptop hinges become loose broken or difficult to move.'],
  [37, 'Keyboard Damage', 'Keyboard keys stop functioning or become physically damaged.'],
  [38, 'Touchpad Failure', 'Laptop touchpad becomes unresponsive or erratic.'],
  [39, 'Liquid Spill Damage', 'Liquid spills onto laptop causing internal short circuits.'],
  [40, 'USB Port Failure', 'USB ports stop detecting connected devices.'],
  [41, 'HDMI Port Damage', 'HDMI output port becomes loose or nonfunctional.'],
  [42, 'No Display', 'Laptop powers on but display shows nothing.'],
  [43, 'Backlight Failure', 'Screen remains dark due to display backlight malfunction.'],
  [44, 'Battery Not Charging', 'Laptop battery does not charge even when plugged in.'],
  [45, 'Laptop Not Powering On', 'Laptop completely fails to start or boot.'],
  [46, 'Fan Noise', 'Cooling fan produces loud unusual sounds.'],
  [47, 'Overheating Laptop', 'Laptop temperature rises excessively during operation.'],
  [48, 'Slow Performance', 'Laptop becomes sluggish while performing normal tasks.'],
  [49, 'System Freezing', 'System becomes stuck and requires restart.'],
  [50, 'High CPU Usage', 'Processor usage remains abnormally high causing slowdowns.'],
  [51, 'SSD HDD Failure', 'Storage drive becomes corrupted damaged or unreadable.'],
  [52, 'Data Corruption', 'Files become damaged inaccessible or unreadable.'],
  [53, 'Blue Screen Error', 'Windows crashes showing BSOD system error screen.'],
  [54, 'Driver Issue', 'Hardware drivers malfunction causing device instability.'],
  [55, 'Operating System Corruption', 'System files become damaged preventing normal boot.'],
  [56, 'BIOS Corruption', 'BIOS firmware becomes damaged affecting system startup.'],
  [57, 'GPU Failure', 'Graphics processor malfunctions causing display or performance issues.'],
  [58, 'RAM Failure', 'Memory modules become faulty causing crashes or boot failures.'],
  [59, 'Ethernet Port Failure', 'Wired network port stops functioning properly.'],
  [60, 'Webcam Not Detected', 'Laptop camera fails to appear or function in applications.'],
  [61, 'Audio Jack Problem', 'Headphone or microphone jack fails to detect devices.'],
  [62, 'Thermal Paste Drying', 'Old thermal paste causes inefficient heat transfer and overheating.'],
  [63, 'Dust Accumulation', 'Dust buildup inside device blocks airflow and affects cooling.'],
  [64, 'Power IC Damage', 'Power management integrated circuit becomes faulty.'],
  [65, 'Charging Cable Damage', 'Charging cable becomes frayed broken or unreliable.']
];

async function insertIssues() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    // Clear existing data (optional, but good for idempotency if requested)
    // await connection.execute('DELETE FROM common_issues');

    const sql = 'INSERT IGNORE INTO common_issues (id, name, description) VALUES ?';
    const [result] = await connection.query(sql, [issues]);

    console.log(`Successfully inserted ${result.affectedRows} issues.`);
  } catch (error) {
    console.error('Error inserting issues:', error);
  } finally {
    if (connection) await connection.end();
  }
}

insertIssues();
