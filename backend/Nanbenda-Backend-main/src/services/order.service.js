const orderRepository = require('../repositories/order.repository');
const productRepository = require('../repositories/product.repository');
const addressRepository = require('../repositories/address.repository');
const shopRepository = require('../repositories/shop.repository');

class OrderService {
  async placeOrder(userId, orderData) {
    const { address_id, items, payment_method } = orderData;
    
    // items is an array of {device_id, quantity, price}
    // we need to convert it to a comma-separated list of IDs for the new structure
    const productIds = [];
    let totalAmount = 0;

    items.forEach(item => {
      totalAmount += (item.price * item.quantity);
      for(let i=0; i<item.quantity; i++) {
        productIds.push(item.device_id);
      }
    });

    // Find nearest shop based on address
    let shop_id = null;
    if (!address_id) {
      throw new Error('Delivery address is required to place an order');
    }

    const address = await addressRepository.getByIdAndUserId(address_id, userId);
    if (address) {
      if (address.latitude && address.longitude) {
        const nearestShop = await shopRepository.findNearestShop(address.latitude, address.longitude);
        if (nearestShop) {
          shop_id = nearestShop.id;
          console.log(`Assigned order to nearest shop: ${nearestShop.shop_name} (ID: ${shop_id})`);
        } else {
          console.warn('No active shops found to assign order');
        }
      } else {
        console.warn(`Address (ID: ${address_id}) has no GPS coordinates. Shop assignment skipped.`);
      }
    } else {
      throw new Error('Invalid address ID');
    }

    const orderId = await orderRepository.createOrder({
      user_id: userId,
      product_ids: productIds.join(','),
      address_id,
      shop_id,
      total_amount: totalAmount,
      payment_method
    });

    return { id: orderId };
  }

  async getUserOrders(userId) {
    const orders = await orderRepository.getOrdersByUser(userId);
    
    // Enrich orders with item details
    return await Promise.all(orders.map(async (order) => {
      const productIds = order.product_ids.split(',').filter(id => id).map(Number);
      
      const counts = {};
      productIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });

      const uniqueIds = Object.keys(counts).map(Number);
      const products = await productRepository.getByIds(uniqueIds);

      const items = products.map(p => ({
        brand: p.brand,
        model: p.model,
        quantity: counts[p.id],
        price_at_purchase: p.price, // Note: In a real app, we should store price at purchase in a separate way, but here we simplify
        image_url: p.image_url
      }));

      return { ...order, items };
    }));
  }

  async getOrderDetails(userId, orderId, userRole) {
    const order = await orderRepository.getOrderById(orderId);
    if (!order) throw new Error('Order not found');

    if (order.user_id !== userId && userRole !== 'admin') {
      throw new Error('Unauthorized access to order details');
    }

    const productIds = order.product_ids.split(',').filter(id => id).map(Number);
    const counts = {};
    productIds.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
    });

    const uniqueIds = Object.keys(counts).map(Number);
    const products = await productRepository.getByIds(uniqueIds);

    const items = products.map(p => ({
      brand: p.brand,
      model: p.model,
      quantity: counts[p.id],
      price_at_purchase: p.price,
      image_url: p.image_url
    }));

    return { ...order, items };
  }

  async getShopOrders(shopId) {
    const orders = await orderRepository.getOrdersByShop(shopId);
    
    return await Promise.all(orders.map(async (order) => {
      const productIds = order.product_ids.split(',').filter(id => id).map(Number);
      const counts = {};
      productIds.forEach(id => {
        counts[id] = (counts[id] || 0) + 1;
      });

      const uniqueIds = Object.keys(counts).map(Number);
      const products = await productRepository.getByIds(uniqueIds);

      const items = products.map(p => ({
        brand: p.brand,
        model: p.model,
        quantity: counts[p.id],
        price_at_purchase: p.price,
        image_url: p.image_url
      }));

      return { ...order, items };
    }));
  }
}

module.exports = new OrderService();
