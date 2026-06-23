const cartRepository = require('../repositories/cart.repository');
const productRepository = require('../repositories/product.repository');

class CartService {
  async getCart(userId) {
    const productIdsStr = await cartRepository.getByUserId(userId);
    if (!productIdsStr) return [];

    const productIds = productIdsStr.split(',').filter(id => id).map(Number);
    if (productIds.length === 0) return [];

    const counts = {};
    productIds.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const uniqueIds = Object.keys(counts).map(Number);
    const products = await productRepository.getByIds(uniqueIds);

    return products.map(product => ({
      ...product,
      quantity: counts[product.id]
    }));
  }

  async addItem(userId, productId) {
    let productIdsStr = await cartRepository.getByUserId(userId);
    let productIds = productIdsStr ? productIdsStr.split(',').filter(id => id) : [];
    
    productIds.push(productId.toString());
    await cartRepository.upsert(userId, productIds.join(','));
    return this.getCart(userId);
  }

  async updateQuantity(userId, productId, quantity) {
    let productIdsStr = await cartRepository.getByUserId(userId);
    let productIds = productIdsStr ? productIdsStr.split(',').filter(id => id) : [];
    
    // Remove all instances of productId
    productIds = productIds.filter(id => id !== productId.toString());
    
    // Add back the requested quantity
    for (let i = 0; i < quantity; i++) {
      productIds.push(productId.toString());
    }
    
    if (productIds.length === 0) {
      await cartRepository.delete(userId);
    } else {
      await cartRepository.upsert(userId, productIds.join(','));
    }
    
    return this.getCart(userId);
  }

  async clearCart(userId) {
    await cartRepository.delete(userId);
    return [];
  }
}

module.exports = new CartService();
