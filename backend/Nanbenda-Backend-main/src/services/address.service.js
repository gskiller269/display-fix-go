const addressRepository = require('../repositories/address.repository');

class AddressService {
  async getUserAddresses(userId) {
    return await addressRepository.getAllByUserId(userId);
  }

  async addAddress(userId, addressData) {
    if (addressData.is_active) {
      await addressRepository.deactivateAllByUserId(userId);
    }
    return await addressRepository.create(userId, addressData);
  }

  async updateAddress(id, userId, addressData) {
    const existing = await addressRepository.getByIdAndUserId(id, userId);
    if (!existing) return false;

    if (addressData.is_active) {
      await addressRepository.deactivateAllByUserId(userId);
    }
    return await addressRepository.update(id, userId, addressData);
  }

  async deleteAddress(id, userId) {
    return await addressRepository.delete(id, userId);
  }

  async setAddressActive(id, userId) {
    const existing = await addressRepository.getByIdAndUserId(id, userId);
    if (!existing) return false;
    
    return await addressRepository.setActive(id, userId);
  }
}

module.exports = new AddressService();
