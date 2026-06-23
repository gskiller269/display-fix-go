const { db } = require('../config');

class ProductRepository {
  async _attachImages(products) {
    if (!products || (Array.isArray(products) && products.length === 0)) return products;

    const isArray = Array.isArray(products);
    const productList = isArray ? products : [products];

    for (const product of productList) {
      if (product.image_ids) {
        const ids = product.image_ids.split(',').map(id => id.trim()).filter(Boolean);
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          const [images] = await db.execute(`SELECT id, image_url FROM images WHERE id IN (${placeholders})`, ids);
          
          // Map images to objects with ID and URL for precise management
          product.images = images.map(img => ({ id: img.id, url: img.image_url }));
          product.image_url = product.images.length > 0 ? product.images[0].url : null;
        } else {
          product.images = [];
          product.image_url = null;
        }
      } else {
        product.images = [];
        product.image_url = null;
      }
    }

    return isArray ? productList : productList[0];
  }

  async getAll(offset = 0, limit = 10, typeId = null) {
    let query = `
      SELECT p.*, pt.name as type, s.shop_name,
             (SELECT AVG(rating) FROM reviews WHERE product_id = p.id) as avg_rating,
             (SELECT COUNT(*) FROM reviews WHERE product_id = p.id) as review_count
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
    `;
    const params = [];

    // Ensure typeId is not just an empty string
    if (typeId && typeId !== '' && typeId !== 'null' && typeId !== 'undefined') {
      query += ` WHERE p.type_id = ?`;
      params.push(typeId);
    }

    query += ` ORDER BY p.id DESC LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));

    // Use db.query instead of db.execute for LIMIT/OFFSET which can be finicky with prepared statements
    const [rows] = await db.query(query, params);
    return await this._attachImages(rows);
  }

  async getFeatured() {
    const [rows] = await db.execute(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      LIMIT 10
    `);
    return await this._attachImages(rows);
  }

  async getBestSellers() {
    const [rows] = await db.execute(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      ORDER BY p.price DESC
      LIMIT 10
    `);
    return await this._attachImages(rows);
  }

  async getMostClicked() {
    const [rows] = await db.execute(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      ORDER BY p.clicks DESC
      LIMIT 4
    `);
    return await this._attachImages(rows);
  }

  async getRandom(limit = 6) {
    const [rows] = await db.query(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      ORDER BY RAND()
      LIMIT ?
    `, [limit]);
    return await this._attachImages(rows);
  }

  async getById(id) {
    const [rows] = await db.execute(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      WHERE p.id = ?
    `, [id]);
    return await this._attachImages(rows[0]);
  }

  async getByIds(ids) {
    if (!ids || ids.length === 0) return [];
    const placeholders = ids.map(() => '?').join(',');
    const [rows] = await db.execute(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      WHERE p.id IN (${placeholders})
    `, ids);
    return await this._attachImages(rows);
  }

  async getBrands() {
    const [rows] = await db.execute('SELECT DISTINCT brand FROM products ORDER BY brand ASC');
    return rows.map(row => row.brand);
  }

  async getModelsByBrand(brand) {
    const [rows] = await db.execute('SELECT DISTINCT model FROM products WHERE brand = ? ORDER BY model ASC', [brand]);
    return rows.map(row => row.model);
  }

  async getByShopId(shopId, offset = 0, limit = 10) {
    const [rows] = await db.query(`
      SELECT p.*, pt.name as type, s.shop_name
      FROM products p 
      JOIN product_types pt ON p.type_id = pt.id
      LEFT JOIN shops s ON p.shop_id = s.id
      WHERE p.shop_id = ?
      ORDER BY p.id DESC
      LIMIT ? OFFSET ?
    `, [shopId, parseInt(limit), parseInt(offset)]);
    return await this._attachImages(rows);
  }

  async create(productData) {
    const { type_id, shop_id, brand, model, description, image_ids, price, tags, active, active_by } = productData;
    const [result] = await db.execute(
      'INSERT INTO products (type_id, shop_id, brand, model, description, image_ids, price, technical_specifications, tags, active, active_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type_id || null, shop_id || null, brand || null, model || null, description || null, image_ids || null, price || null, tags || null, tags || null, active !== undefined ? active : true, active_by || 'admin']
    );
    const newProduct = { id: result.insertId, ...productData };
    return await this._attachImages(newProduct);
  }

  async update(id, productData) {
    const { type_id, shop_id, brand, model, description, image_ids, price, tags, active, active_by } = productData;
    const [result] = await db.execute(
      'UPDATE products SET type_id = ?, shop_id = ?, brand = ?, model = ?, description = ?, image_ids = ?, price = ?, technical_specifications = ?, tags = ?, active = ?, active_by = ? WHERE id = ?',
      [type_id || null, shop_id || null, brand || null, model || null, description || null, image_ids || null, price || null, tags || null, tags || null, active !== undefined ? active : true, active_by || 'admin', id]
    );
    return result.affectedRows > 0;
  }



  async incrementClicks(id) {
    const [result] = await db.execute('UPDATE products SET clicks = clicks + 1 WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  async delete(id) {
    const [result] = await db.execute('DELETE FROM products WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new ProductRepository();
