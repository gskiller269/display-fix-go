const shopRepository = require('../repositories/shop.repository');
const AuthRepository = require('../repositories/auth.repository');
const ImageRepository = require('../repositories/image.repository');

class ShopService {
  async listActiveShops() {
    return await shopRepository.getAllActive();
  }

  async listAllShops() {
    return await shopRepository.getAll();
  }

  async listPendingShops() {
    return await shopRepository.getPending();
  }

  async getShopById(id) {
    return await shopRepository.getById(id);
  }

  async getMyShop(ownerId) {
    return await shopRepository.getByOwnerId(ownerId);
  }

  async activateShop(id) {
    const shop = await shopRepository.getById(id);
    if (!shop) throw new Error('Shop not found');

    // 1. Update shop status
    await shopRepository.updateStatus(id, 'active');

    // 2. Update owner role to shop_owner and link shop_id
    await AuthRepository.updateUserRole(shop.owner_id, 'shop_owner');
    await AuthRepository.updateShopId(shop.owner_id, id);

    return { success: true, message: 'Shop activated and owner role updated' };
  }

  async registerShop(ownerId, shopData) {
    // Check if user already has a shop
    const existing = await shopRepository.getByOwnerId(ownerId);
    if (existing) {
      throw new Error('You already have a shop registered');
    }
    return await shopRepository.create(ownerId, shopData);
  }

  async updateShop(ownerId, id, shopData) {
    const shop = await shopRepository.getById(id);
    if (!shop) throw new Error('Shop not found');
    
    // Authorization: Only owner or admin can update
    if (shop.owner_id !== ownerId) {
      throw new Error('Unauthorized to update this shop');
    }

    if (shopData.image_url) {
      // Store in images table as requested
      await ImageRepository.create(`Shop Logo - ${shopData.shop_name || shop.shop_name}`, shopData.image_url);
    }

    return await shopRepository.update(id, { ...shop, ...shopData });
  }

  async getShopTechnicians(shopId) {
    return await shopRepository.getTechniciansByShopId(shopId);
  }
}

module.exports = new ShopService();
