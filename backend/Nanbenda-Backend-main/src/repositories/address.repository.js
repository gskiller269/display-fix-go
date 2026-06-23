const { db } = require('../config');

class AddressRepository {
  async getAllByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_active DESC, created_at DESC',
      [userId]
    );
    return rows;
  }

  async getByIdAndUserId(id, userId) {
    const [rows] = await db.execute(
      'SELECT * FROM addresses WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0];
  }

  async deactivateAllByUserId(userId) {
    await db.execute('UPDATE addresses SET is_active = FALSE WHERE user_id = ?', [userId]);
  }

  async create(userId, addressData) {
    const { label, full_name, mobile_number, address_line1, address_line2, landmark, city, state, pincode, is_active, latitude, longitude } = addressData;
    const [result] = await db.execute(
      'INSERT INTO addresses (user_id, label, full_name, mobile_number, address_line1, address_line2, landmark, city, state, pincode, is_active, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, label || 'Home', full_name, mobile_number, address_line1, address_line2 || null, landmark || null, city, state, pincode, is_active || false, latitude || null, longitude || null]
    );
    return { id: result.insertId, ...addressData, user_id: userId };
  }

  async update(id, userId, addressData) {
    const { label, full_name, mobile_number, address_line1, address_line2, landmark, city, state, pincode, is_active, latitude, longitude } = addressData;
    const [result] = await db.execute(
      'UPDATE addresses SET label = ?, full_name = ?, mobile_number = ?, address_line1 = ?, address_line2 = ?, landmark = ?, city = ?, state = ?, pincode = ?, is_active = ?, latitude = ?, longitude = ? WHERE id = ? AND user_id = ?',
      [label || 'Home', full_name, mobile_number, address_line1, address_line2 || null, landmark || null, city, state, pincode, is_active || false, latitude || null, longitude || null, id, userId]
    );
    return result.affectedRows > 0;
  }

  async delete(id, userId) {
    const [result] = await db.execute('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }

  async setActive(id, userId) {
    await this.deactivateAllByUserId(userId);
    const [result] = await db.execute(
      'UPDATE addresses SET is_active = TRUE WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new AddressRepository();
