const productRepository = require('../repositories/product.repository');

class ProductService {
  async getAllProducts(page = 1, limit = 10, typeId = null) {
    const offset = (page - 1) * limit;
    return await productRepository.getAll(offset, limit, typeId);
  }

  async getFeaturedProducts() {
    return await productRepository.getFeatured();
  }

  async getBestSellers() {
    return await productRepository.getBestSellers();
  }

  async getMostClickedProducts() {
    return await productRepository.getMostClicked();
  }

  async getRandomProducts(limit) {
    return await productRepository.getRandom(limit);
  }

  async getProductById(id) {
    return await productRepository.getById(id);
  }

  async getBrands() {
    return await productRepository.getBrands();
  }

  async getModelsByBrand(brand) {
    return await productRepository.getModelsByBrand(brand);
  }

  async createProduct(productData) {
    return await productRepository.create(productData);
  }

  async updateProduct(id, productData) {
    return await productRepository.update(id, productData);
  }

  async incrementClicks(id) {
    return await productRepository.incrementClicks(id);
  }

  async deleteProduct(id) {
    return await productRepository.delete(id);
  }

  async getProductsByShopId(shopId, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    return await productRepository.getByShopId(shopId, offset, limit);
  }
}

module.exports = new ProductService();
