const locationRepository = require('../repositories/location.repository');

class LocationService {
  async updateLocation(locationData) {
    return await locationRepository.updateLocation(locationData);
  }

  async getLocation(type, id) {
    return await locationRepository.getLocation(type, id);
  }

  async stopTracking(type, id) {
    return await locationRepository.deleteLocation(type, id);
  }
}

module.exports = new LocationService();
