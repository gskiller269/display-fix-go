const { db } = require('../config');

class BannerRepository {
  async getAllActive() {
    const [rows] = await db.execute(`
      SELECT b.*, i.image_url 
      FROM banners b
      LEFT JOIN images i ON b.image_id = i.id
    `);
    return rows;
  }

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT b.*, i.image_url 
      FROM banners b
      LEFT JOIN images i ON b.image_id = i.id
      WHERE b.id = ?
    `, [id]);
    return rows[0] || null;
  }

  async create(bannerData) {
    const { title, description, image_id } = bannerData;
    const [result] = await db.execute(
      'INSERT INTO banners (title, description, image_id) VALUES (?, ?, ?)',
      [title, description, image_id]
    );
    return { id: result.insertId, ...bannerData };
  }

  async update(id, bannerData) {
    const fields = [];
    const values = [];
    
    if (bannerData.title !== undefined) {
      fields.push('title = ?');
      values.push(bannerData.title);
    }
    if (bannerData.description !== undefined) {
      fields.push('description = ?');
      values.push(bannerData.description);
    }
    if (bannerData.image_id !== undefined) {
      fields.push('image_id = ?');
      values.push(bannerData.image_id);
    }
    
    if (fields.length === 0) return true;
    
    values.push(id);
    const [result] = await db.execute(
      `UPDATE banners SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM banners WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new BannerRepository();
