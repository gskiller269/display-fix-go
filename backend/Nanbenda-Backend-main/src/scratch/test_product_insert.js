const { db } = require('../config');

async function testInsert() {
  try {
    const productData = {
      type_id: 1, // Assume type 1 exists
      shop_id: 7, // Shop 7 exists
      brand: 'Test Brand',
      model: 'Test Model',
      description: 'Test Description',
      image_ids: '1',
      price: '999.99',
      tags: 'test, tags',
      active: 1,
      active_by: 'shopowner'
    };

    const { type_id, shop_id, brand, model, description, image_ids, price, tags, active, active_by } = productData;
    const [result] = await db.execute(
      'INSERT INTO products (type_id, shop_id, brand, model, description, image_ids, price, technical_specifications, tags, active, active_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [type_id || null, shop_id || null, brand || null, model || null, description || null, image_ids || null, price || null, tags || null, tags || null, active !== undefined ? active : true, active_by || 'admin']
    );
    console.log('Insert success, ID:', result.insertId);
    process.exit(0);
  } catch (e) {
    console.error('Insert failed:', e);
    process.exit(1);
  }
}

testInsert();
