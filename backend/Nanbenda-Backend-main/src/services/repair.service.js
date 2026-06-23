const RepairRepository = require('../repositories/repair.repository');
const addressRepository = require('../repositories/address.repository');
const shopRepository = require('../repositories/shop.repository');

class RepairService {
  async createRepair(userId, repairData) {
    const { address_id, latitude, longitude } = repairData;
    
    if (!address_id) {
      throw new Error('Delivery address is required for repair booking');
    }

    // Find nearest shop based on coordinates (prefer passed coordinates)
    let shop_id = null;
    let searchLat = latitude;
    let searchLng = longitude;

    if (!searchLat || !searchLng) {
      const address = await addressRepository.getByIdAndUserId(address_id, userId);
      if (address) {
        searchLat = address.latitude;
        searchLng = address.longitude;
      } else {
        throw new Error('Invalid address ID provided');
      }
    }

    if (searchLat && searchLng) {
      const nearestShop = await shopRepository.findNearestShop(searchLat, searchLng);
      if (nearestShop) {
        shop_id = nearestShop.id;
        console.log(`Assigned repair to nearest shop: ${nearestShop.shop_name} (ID: ${shop_id})`);
      } else {
        console.warn('No active shops found to assign repair');
      }
    } else {
      console.warn(`No GPS coordinates provided for shop assignment.`);
    }

    return await RepairRepository.create(userId, { ...repairData, shop_id });
  }

  async getShopRepairs(shopId) {
    return await RepairRepository.getByShopId(shopId);
  }

  async getActiveRepairs(userId) {
    return await RepairRepository.getActiveByUserId(userId);
  }

  async getTechnicianRepairs(techId) {
    return await RepairRepository.getByTechnicianId(techId);
  }

  async getRepairById(id, userId, userRole) {
    const repair = await RepairRepository.getById(id, userId, userRole);
    if (!repair) {
      throw new Error('Repair not found');
    }
    return repair;
  }

  async updateStatus(id, statusData, userId, userRole) {
    // Verify permissions
    if (userRole === 'customer') {
      const repair = await RepairRepository.getById(id, userId, userRole);
      if (!repair) {
        throw new Error('Unauthorized or repair not found');
      }
    } else if (userRole === 'technician') {
      const repair = await RepairRepository.getById(id, userId, 'admin'); // Get full record
      if (!repair || repair.technician_id !== userId) {
        throw new Error('Unauthorized. This repair is not assigned to you.');
      }
    }

    const updated = await RepairRepository.updateStatus(id, statusData);
    if (!updated) {
      throw new Error('Failed to update status');
    }
    return updated;
  }

  async updateLocation(id, locationData) {
    const updated = await RepairRepository.updateLocation(id, locationData);
    if (!updated) {
      throw new Error('Failed to update location');
    }
    return updated;
  }
}

module.exports = new RepairService();
