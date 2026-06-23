const productTypeRepository = require('../repositories/product_type.repository');

class ProductTypeService {
  async getAllProductTypes() {
    return await productTypeRepository.getAll();
  }

  async getProductTypeById(id) {
    return await productTypeRepository.getById(id);
  }

  async createProductType(name) {
    return await productTypeRepository.create(name);
  }

  async updateProductType(id, name) {
    return await productTypeRepository.update(id, name);
  }

  async deleteProductType(id) {
    return await productTypeRepository.delete(id);
  }
}

module.exports = new ProductTypeService();
