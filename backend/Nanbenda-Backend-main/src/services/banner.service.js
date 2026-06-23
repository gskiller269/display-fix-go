const bannerRepository = require('../repositories/banner.repository');

class BannerService {
  async getActiveBanners() {
    return await bannerRepository.getAllActive();
  }

  async getBannerById(id) {
    return await bannerRepository.getById(id);
  }

  async createBanner(bannerData) {
    return await bannerRepository.create(bannerData);
  }

  async updateBanner(id, bannerData) {
    return await bannerRepository.update(id, bannerData);
  }

  async deleteBanner(id) {
    return await bannerRepository.delete(id);
  }
}

module.exports = new BannerService();
