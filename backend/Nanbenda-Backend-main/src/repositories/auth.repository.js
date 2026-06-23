const { db } = require('../config');

class AuthRepository {
  async findByMobileNumber(mobileNumber) {
    const [rows] = await db.execute('SELECT * FROM users WHERE mobile_number = ?', [mobileNumber]);
    return rows[0];
  }

  async findByUsername(username) {
    const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  async findByUsernameOrMobile(identifier) {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? OR mobile_number = ?',
      [identifier, identifier]
    );
    return rows[0];
  }

  async findById(id) {
    const [rows] = await db.execute('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async create(userData) {
    const { username, mobile_number, email, password, role, profile_image_url, shop_id } = userData;
    const [result] = await db.execute(
      'INSERT INTO users (username, mobile_number, email, password, role, profile_image_url, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username || null, mobile_number || null, email || null, password, role || 'customer', profile_image_url || null, shop_id || null]
    );
    return { id: result.insertId, ...userData };
  }

  async updateProfile(id, profileData) {
    const { email, username, mobile_number } = profileData;
    const [result] = await db.execute(
      `UPDATE users SET 
        email = COALESCE(?, email), 
        username = COALESCE(?, username), 
        mobile_number = COALESCE(?, mobile_number) 
      WHERE id = ?`,
      [email || null, username || null, mobile_number || null, id]
    );
    return result.affectedRows > 0;
  }

  async updateProfileImage(id, imageUrl) {
    const [result] = await db.execute('UPDATE users SET profile_image_url = ? WHERE id = ?', [imageUrl, id]);
    return result.affectedRows > 0;
  }

  async updateUserRole(id, role) {
    const [result] = await db.execute('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await db.execute('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  }

  async updateShopId(id, shopId) {
    const [result] = await db.execute('UPDATE users SET shop_id = ? WHERE id = ?', [shopId, id]);
    return result.affectedRows > 0;
  }

  async getAll(role = null) {
    let sql = 'SELECT id, username, mobile_number, email, role, profile_image_url, status, created_at FROM users';
    const params = [];
    if (role) {
      sql += ' WHERE role = ?';
      params.push(role);
    }
    sql += ' ORDER BY created_at DESC';
    const [rows] = await db.execute(sql, params);
    return rows;
  }
}

module.exports = new AuthRepository();
