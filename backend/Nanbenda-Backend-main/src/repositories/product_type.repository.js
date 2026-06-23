const { db } = require('../config');

class ProductTypeRepository {
  async getAll() {
    const query = `
      SELECT pt.*, i.image_url 
      FROM product_types pt 
      LEFT JOIN images i ON pt.image_id = i.id 
      ORDER BY pt.name ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  async getById(id) {
    const query = `
      SELECT pt.*, i.image_url 
      FROM product_types pt 
      LEFT JOIN images i ON pt.image_id = i.id 
      WHERE pt.id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  async create(name, imageId = null) {
    const [result] = await db.execute(
      'INSERT INTO product_types (name, image_id) VALUES (?, ?)', 
      [name, imageId]
    );
    return { id: result.insertId, name, image_id: imageId };
  }

  async update(id, data) {
    const { name, image_id } = data;
    const [result] = await db.execute(
      'UPDATE product_types SET name = COALESCE(?, name), image_id = COALESCE(?, image_id) WHERE id = ?', 
      [name, image_id, id]
    );
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM product_types WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProductTypeRepository();
