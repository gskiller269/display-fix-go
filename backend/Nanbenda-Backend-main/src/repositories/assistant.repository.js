const { db } = require('../config');

class AssistantRepository {
  async getProductDetailsByIds(productIds) {
    if (!productIds || productIds.length === 0) return [];
    const [rows] = await db.execute(
      `SELECT p.*, pt.name as type FROM products p 
       JOIN product_types pt ON p.type_id = pt.id 
       WHERE p.id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    return rows;
  }

  async saveChatHistory(userId, productIds, query, result, aiModel) {
    const [insertResult] = await db.execute(
      'INSERT INTO assistant_history (user_id, device_ids, query, result, ai_model) VALUES (?, ?, ?, ?, ?)',
      [userId, productIds ? JSON.stringify(productIds) : null, query, result, aiModel]
    );
    return insertResult.insertId;
  }

  async getChatHistoryByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT h.* FROM assistant_history h 
       WHERE h.user_id = ? 
       ORDER BY h.created_at ASC`,
      [userId]
    );
    return rows;
  }

  async getProductNamesByIds(productIds) {
    if (!productIds || productIds.length === 0) return [];
    const [products] = await db.execute(
      `SELECT brand, model FROM products WHERE id IN (${productIds.map(() => '?').join(',')})`,
      productIds
    );
    return products.map(p => `${p.brand} ${p.model}`);
  }

  async clearChatHistory(userId) {
    const [result] = await db.execute(
      'DELETE FROM assistant_history WHERE user_id = ?',
      [userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new AssistantRepository();
