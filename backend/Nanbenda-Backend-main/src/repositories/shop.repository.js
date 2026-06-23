const { db } = require('../config');

class ShopRepository {
  async getAllActive() {
    const [rows] = await db.execute('SELECT * FROM shops WHERE status = "active" ORDER BY rating DESC');
    return rows;
  }

  async getAll() {
    const [rows] = await db.execute(`
      SELECT s.*, u.username as owner_name, u.mobile_number as owner_mobile, u.email as owner_email, u.profile_image_url as owner_profile_image
      FROM shops s 
      JOIN users u ON s.owner_id = u.id 
      ORDER BY s.created_at DESC
    `);
    return rows;
  }

  async getPending() {
    const [rows] = await db.execute(`
      SELECT s.*, u.username as owner_name, u.mobile_number as owner_mobile, u.email as owner_email, u.profile_image_url as owner_profile_image
      FROM shops s 
      JOIN users u ON s.owner_id = u.id 
      WHERE s.status = 'pending' 
      ORDER BY s.created_at DESC
    `);
    return rows;
  }

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM shops WHERE id = ?', [id]);
    return rows[0];
  }

  async getByOwnerId(ownerId) {
    const [rows] = await db.execute('SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
    return rows[0];
  }

  async create(ownerId, shopData) {
    const { shop_name, description, phone_number, address, location, latitude, longitude, image_url, status } = shopData;
    const [result] = await db.execute(
      'INSERT INTO shops (owner_id, shop_name, description, phone_number, address, location, latitude, longitude, image_url, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [ownerId, shop_name, description || null, phone_number, address, location || null, latitude || null, longitude || null, image_url || null, status || 'pending']
    );
    return { id: result.insertId, owner_id: ownerId, ...shopData };
  }


  async update(id, shopData) {
    const { shop_name, description, phone_number, address, location, latitude, longitude, image_url, status } = shopData;
    const [result] = await db.execute(
      'UPDATE shops SET shop_name = ?, description = ?, phone_number = ?, address = ?, location = ?, latitude = ?, longitude = ?, image_url = ?, status = ? WHERE id = ?',
      [shop_name, description, phone_number, address, location, latitude, longitude, image_url, status, id]
    );
    return result.affectedRows > 0;
  }

  async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE shops SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async getTechniciansByShopId(shopId) {
    const [rows] = await db.execute(`
      SELECT id, username, mobile_number, email, profile_image_url, status 
      FROM users 
      WHERE shop_id = ? AND role = 'technician'
    `, [shopId]);
    return rows;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM shops WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async findNearestShop(lat, lng) {
    const [rows] = await db.execute(`
      SELECT *, (
        6371 * acos (
          cos ( radians(?) )
          * cos( radians( latitude ) )
          * cos( radians( longitude ) - radians(?) )
          + sin ( radians(?) )
          * sin( radians( latitude ) )
        )
      ) AS distance
      FROM shops
      WHERE status = 'active'
      ORDER BY distance ASC
      LIMIT 1
    `, [lat, lng, lat]);
    return rows[0];
  }
}

module.exports = new ShopRepository();
