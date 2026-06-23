const { db } = require('../config');

class RepairRepository {
  async create(userId, repairData) {
    const { 
      device_brand, 
      device_model, 
      problem_type, 
      problem_description, 
      image_url, 
      address_id,
      shop_id
    } = repairData;

    const [result] = await db.execute(
      'INSERT INTO repair_bookings (user_id, device_brand, device_model, problem_type, problem_description, image_url, address_id, shop_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [userId, device_brand, device_model, problem_type, problem_description || null, image_url || null, address_id || null, shop_id || null]
    );
    return { id: result.insertId, ...repairData, user_id: userId };
  }

  async getByShopId(shopId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as customer_name, a.full_name as contact_name, a.mobile_number, a.address_line1, a.city 
       FROM repair_bookings r 
       JOIN users u ON r.user_id = u.id 
       JOIN addresses a ON r.address_id = a.id
       WHERE r.shop_id = ? 
       ORDER BY r.created_at DESC`,
      [shopId]
    );
    return rows;
  }

  async getActiveByUserId(userId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as technician_name, u.profile_image_url as technician_photo, u.mobile_number as technician_mobile,
               a.latitude as user_lat, a.longitude as user_lng,
               s.shop_name, s.phone_number as shop_phone, s.image_url as shop_image
       FROM repair_bookings r 
       LEFT JOIN users u ON r.technician_id = u.id 
       LEFT JOIN addresses a ON r.address_id = a.id
       LEFT JOIN shops s ON r.shop_id = s.id
       WHERE r.user_id = ? AND r.status != 'repaired'
       ORDER BY r.created_at DESC`,
      [userId]
    );
    return rows;
  }

  async getById(id, userId, userRole) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as technician_name, u.profile_image_url as technician_photo, u.mobile_number as technician_mobile,
               a.latitude as user_lat, a.longitude as user_lng,
               s.shop_name, s.phone_number as shop_phone, s.image_url as shop_image
       FROM repair_bookings r 
       LEFT JOIN users u ON r.technician_id = u.id 
       LEFT JOIN addresses a ON r.address_id = a.id
       LEFT JOIN shops s ON r.shop_id = s.id
       WHERE r.id = ? AND (r.user_id = ? OR ? = 'admin')`,
      [id, userId, userRole]
    );
    return rows[0];
  }

  async getByTechnicianId(techId) {
    const [rows] = await db.execute(
      `SELECT r.*, u.username as customer_name, a.full_name as contact_name, a.mobile_number, 
               a.address_line1, a.address_line2, a.landmark, a.city, a.pincode,
               a.latitude as user_lat, a.longitude as user_lng
       FROM repair_bookings r 
       JOIN users u ON r.user_id = u.id 
       JOIN addresses a ON r.address_id = a.id
       WHERE r.technician_id = ? AND r.status != 'repaired'
       ORDER BY r.created_at DESC`,
      [techId]
    );
    return rows;
  }

  async updateStatus(id, statusData) {
    const { status, technician_id, eta } = statusData;
    const [result] = await db.execute(
      'UPDATE repair_bookings SET status = COALESCE(?, status), technician_id = COALESCE(?, technician_id), eta = COALESCE(?, eta) WHERE id = ?',
      [status || null, technician_id || null, eta || null, id]
    );
    return result.affectedRows > 0;
  }

  async updateLocation(id, locationData) {
    const { lat, lng } = locationData;
    const [result] = await db.execute(
      'UPDATE repair_bookings SET technician_location_lat = ?, technician_location_lng = ? WHERE id = ?',
      [lat, lng, id]
    );
    return result.affectedRows > 0;
  }
}

module.exports = new RepairRepository();
