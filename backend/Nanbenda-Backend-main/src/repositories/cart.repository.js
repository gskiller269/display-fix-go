const { db } = require('../config');

class CartRepository {
  async getByUserId(userId) {
    const [rows] = await db.execute('SELECT product_ids FROM cart WHERE user_id = ?', [userId]);
    return rows[0] ? rows[0].product_ids : '';
  }

  async upsert(userId, productIds) {
    const [rows] = await db.execute('SELECT user_id FROM cart WHERE user_id = ?', [userId]);
    if (rows.length > 0) {
      await db.execute('UPDATE cart SET product_ids = ? WHERE user_id = ?', [productIds, userId]);
    } else {
      await db.execute('INSERT INTO cart (user_id, product_ids) VALUES (?, ?)', [userId, productIds]);
    }
  }

  async delete(userId) {
    await db.execute('DELETE FROM cart WHERE user_id = ?', [userId]);
  }
}

module.exports = new CartRepository();
