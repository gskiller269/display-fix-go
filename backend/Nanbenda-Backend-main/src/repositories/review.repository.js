const { db } = require('../config');

class ReviewRepository {
  async getByProductId(productId) {
    const [rows] = await db.execute(`
      SELECT r.*, u.username, u.profile_image_url
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [productId]);
    return rows;
  }

  async getByUserId(userId) {
    const [rows] = await db.execute(`
      SELECT r.*, p.brand, p.model, p.image_ids
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `, [userId]);
    
    // Attach first image URL for each product in reviews
    for (const row of rows) {
      if (row.image_ids) {
        const ids = row.image_ids.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const [images] = await db.execute(`SELECT image_url FROM images WHERE id = ?`, [ids[0]]);
          row.image_url = images.length > 0 ? images[0].image_url : null;
        }
      }
    }
    
    return rows;
  }

  async create(reviewData) {
    const { user_id, product_id, rating, comment } = reviewData;
    const [result] = await db.execute(
      'INSERT INTO reviews (user_id, product_id, rating, comment) VALUES (?, ?, ?, ?)',
      [user_id, product_id, rating, comment]
    );
    return { id: result.insertId, ...reviewData };
  }

  async delete(id, userId) {
    const [result] = await db.execute('DELETE FROM reviews WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
  }
}

module.exports = new ReviewRepository();
