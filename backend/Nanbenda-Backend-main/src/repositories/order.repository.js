const { db } = require('../config');

class OrderRepository {
  async createOrder(orderData) {
    const { user_id, product_ids, address_id, shop_id, total_amount, payment_method } = orderData;
    
    const [result] = await db.execute(
      'INSERT INTO orders (user_id, product_ids, address_id, shop_id, total_amount, payment_method) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, product_ids, address_id, shop_id || null, total_amount, payment_method || 'COD']
    );
    
    return result.insertId;
  }

  async getOrdersByUser(userId) {
    const [rows] = await db.execute(
      `SELECT o.*, a.city, a.state, a.pincode 
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async getOrderById(orderId) {
    const [rows] = await db.execute(
      `SELECT o.*, a.full_name, a.mobile_number, a.address_line1, a.address_line2, a.city, a.state, a.pincode 
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.id = ?`,
      [orderId]
    );
    return rows[0] || null;
  }

  async getOrdersByShop(shopId) {
    const [rows] = await db.execute(
      `SELECT o.*, a.full_name, a.mobile_number, a.address_line1, a.address_line2, a.city, a.state, a.pincode 
       FROM orders o 
       JOIN addresses a ON o.address_id = a.id 
       WHERE o.shop_id = ? 
       ORDER BY o.created_at DESC`,
      [shopId]
    );
    return rows;
  }
}

module.exports = new OrderRepository();
