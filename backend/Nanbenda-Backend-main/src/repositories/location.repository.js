const { db } = require('../config');

class LocationRepository {
  async updateLocation(data) {
    const { tracking_type, target_id, technician_id, lat, lng, speed, bearing } = data;
    
    // UPSERT: Insert or update if (tracking_type, target_id) exists
    const query = `
      INSERT INTO location (tracking_type, target_id, technician_id, lat, lng, speed, bearing)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE 
        technician_id = VALUES(technician_id),
        lat = VALUES(lat),
        lng = VALUES(lng),
        speed = VALUES(speed),
        bearing = VALUES(bearing),
        updated_at = CURRENT_TIMESTAMP
    `;
    
    const [result] = await db.execute(query, [tracking_type, target_id, technician_id, lat, lng, speed || 0, bearing || 0]);
    return result.affectedRows > 0;
  }

  async getLocation(type, id) {
    const [rows] = await db.execute(
      'SELECT * FROM location WHERE tracking_type = ? AND target_id = ?',
      [type, id]
    );
    return rows[0] || null;
  }

  async deleteLocation(type, id) {
    const [result] = await db.execute(
      'DELETE FROM location WHERE tracking_type = ? AND target_id = ?',
      [type, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new LocationRepository();
