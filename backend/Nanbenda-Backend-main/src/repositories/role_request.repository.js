const { db } = require('../config');

class RoleRequestRepository {
  async create(requestData) {
    const { user_id, requested_role, target_id, message, shop_details, aadhar_image_id, shop_doc_image_id, shop_image_id } = requestData;
    // Store shop_details as JSON string in the message field if it's a shop_owner request
    const finalMessage = requested_role === 'shop_owner' && shop_details 
      ? JSON.stringify(shop_details) 
      : message;

    const [result] = await db.execute(
      'INSERT INTO role_requests (user_id, requested_role, target_id, message, aadhar_image_id, shop_doc_image_id, shop_image_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, requested_role, target_id || null, finalMessage || null, aadhar_image_id || null, shop_doc_image_id || null, shop_image_id || null]
    );
    return result.insertId;
  }

  async getAdminRequests(status = 'pending') {
    let sql = `SELECT r.*, u.username, u.mobile_number, u.email,
               img1.image_url as aadhar_url, img2.image_url as shop_doc_url, img3.image_url as shop_url
               FROM role_requests r 
               JOIN users u ON r.user_id = u.id 
               LEFT JOIN images img1 ON r.aadhar_image_id = img1.id
               LEFT JOIN images img2 ON r.shop_doc_image_id = img2.id
               LEFT JOIN images img3 ON r.shop_image_id = img3.id
               WHERE 1=1`;
    
    if (status === 'all') {
      // Return everything (no extra filters)
    } else if (status === 'history') {
      sql += " AND r.status IN ('accepted', 'rejected')";
    } else {
      sql += " AND r.requested_role = 'shop_owner' AND r.status = 'pending'";
    }
    
    sql += " ORDER BY r.created_at DESC";
    const [rows] = await db.execute(sql);
    return rows;
  }


  async getShopRequests(shopId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username, u.mobile_number, u.email 
       FROM role_requests r 
       JOIN users u ON r.user_id = u.id 
       WHERE r.requested_role = 'technician' AND r.target_id = ? AND r.status = 'pending'
       ORDER BY r.created_at DESC`,
      [shopId]
    );
    return rows;
  }

  async getByUserId(userId) {
    const [rows] = await db.execute(
      'SELECT * FROM role_requests WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    return rows[0];
  }

  async updateStatus(id, status) {
    const [result] = await db.execute(
      'UPDATE role_requests SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT r.*, img1.image_url as aadhar_url, img2.image_url as shop_doc_url, img3.image_url as shop_url
      FROM role_requests r
      LEFT JOIN images img1 ON r.aadhar_image_id = img1.id
      LEFT JOIN images img2 ON r.shop_doc_image_id = img2.id
      LEFT JOIN images img3 ON r.shop_image_id = img3.id
      WHERE r.id = ?
    `, [id]);
    return rows[0];
  }

  async updateUserRole(userId, role) {
    const [result] = await db.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, userId]
    );
    return result.affectedRows > 0;
  }

  async updateUserShop(userId, shopId) {
    const [result] = await db.execute(
      'UPDATE users SET shop_id = ? WHERE id = ?',
      [shopId, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new RoleRequestRepository();
