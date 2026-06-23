const { db } = require('../config');

class ImageRepository {
  async create(name, imageUrl) {
    const [result] = await db.execute(
      'INSERT INTO images (name, image_url) VALUES (?, ?)',
      [name, imageUrl]
    );
    return { id: result.insertId, name, image_url: imageUrl };
  }

  async getById(id) {
    const [rows] = await db.execute('SELECT * FROM images WHERE id = ?', [id]);
    return rows[0];
  }

  async getAll() {
    const [rows] = await db.execute('SELECT * FROM images');
    return rows;
  }
}

module.exports = new ImageRepository();
