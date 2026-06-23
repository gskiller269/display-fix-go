const mysql = require('mysql2/promise');

const dbConfig = {
  host: 'localhost',
  user: 'ajaysaagar',
  password: 'aass209c',
  database: 'fixmart'
};

async function seedProducts() {
  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database.');

    const [shops] = await connection.execute('SELECT id FROM shops LIMIT 1');
    const shopId = shops.length > 0 ? shops[0].id : 1;

    const products = [];
    for (let i = 1; i <= 50; i++) {
      const modelNum = 25 + i;
      products.push([
        1, // type_id
        'Samsung',
        `Galaxy S${modelNum} Ultra 5G`,
        `Samsung Galaxy S${modelNum} Ultra 5G AI Smartphone (Titanium Silverblue, 12GB RAM, 256GB Storage), 200MP Camera, S Pen Included, Long Battery Life`,
        '32,33,34,35,36',
        99998.00 + (i * 100),
        1, // active
        'admin',
        shopId,
        0, // clicks
        '12GB RAM, 256GB Storage, 200MP Camera',
        '12GB RAM, 256GB Storage, 200MP Camera'
      ]);
    }

    const sql = `
      INSERT INTO products 
      (type_id, brand, model, description, image_ids, price, active, active_by, shop_id, clicks, technical_specifications, tags) 
      VALUES ?
    `;

    const [result] = await connection.query(sql, [products]);
    console.log(`Successfully inserted ${result.affectedRows} products.`);

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    if (connection) await connection.end();
  }
}

seedProducts();
