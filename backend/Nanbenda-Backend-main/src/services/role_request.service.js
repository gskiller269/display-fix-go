const RoleRequestRepository = require('../repositories/role_request.repository');
const ShopRepository = require('../repositories/shop.repository');

class RoleRequestService {
  async getMyRequest(userId) {
    return await RoleRequestRepository.getByUserId(userId);
  }

  async createRequest(userId, requestData) {
    return await RoleRequestRepository.create({ ...requestData, user_id: userId });
  }

  async getAdminRequests(status) {
    return await RoleRequestRepository.getAdminRequests(status);
  }

  async getShopRequests(shopId) {
    return await RoleRequestRepository.getShopRequests(shopId);
  }

  async handleAction(id, status) {
    console.log(`Processing status update: ${status} for request ID: ${id}`);
    const request = await RoleRequestRepository.getById(id);
    if (!request) throw new Error('Request not found');

    if (status === 'accepted') {
      console.log(`Accepting request for user ${request.user_id} to become ${request.requested_role}`);

      await RoleRequestRepository.updateStatus(id, 'accepted');
      await RoleRequestRepository.updateUserRole(request.user_id, request.requested_role);

      // Additional Logic based on role: Create shop for shop_owners, Link shop for technicians
      if (request.requested_role === 'shop_owner') {
        let shop = await ShopRepository.getByOwnerId(request.user_id);
        if (!shop) {
          console.log(`Creating shop for new owner ${request.user_id}`);
          let shopDetails = {};
          try {
            shopDetails = JSON.parse(request.message);
          } catch (e) {
            console.log("No valid JSON shop details in message, using defaults");
          }

          shop = await ShopRepository.create(request.user_id, {
            shop_name: shopDetails.shop_name || 'Nanbenda Partner Shop',
            phone_number: shopDetails.phone_number || 'Unset',
            address: shopDetails.address || 'Unset Address',
            location: `${shopDetails.city || ''}, ${shopDetails.state || ''}`.trim().replace(/^, |, $/g, '') || 'Unset Location',
            latitude: shopDetails.latitude || null,
            longitude: shopDetails.longitude || null,
            image_url: request.shop_url || null,
            status: 'active'
          });
        } else {
          console.log(`Activating existing shop ID: ${shop.id} for owner ${request.user_id}`);
          await ShopRepository.updateStatus(shop.id, 'active');
          if (request.shop_url) {
             await ShopRepository.update(shop.id, { ...shop, image_url: request.shop_url });
          }
        }
        
        await RoleRequestRepository.updateUserShop(request.user_id, shop.id);
      } else if (request.requested_role === 'technician') {
        if (request.target_id) {
          console.log(`Linking technician ${request.user_id} to shop ${request.target_id}`);
          await RoleRequestRepository.updateUserShop(request.user_id, request.target_id);
        }
      }


      return { success: true, message: 'Request accepted and permissions updated' };
    } else {
      console.log(`Rejecting request ID: ${id}`);
      await RoleRequestRepository.updateStatus(id, 'rejected');
      return { success: true, message: 'Request rejected' };
    }
  }
}

module.exports = new RoleRequestService();
