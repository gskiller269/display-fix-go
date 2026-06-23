const cartService = require('../services/cart.service');

class CartController {
  async getCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.getCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async addItem(req, res) {
    try {
      const userId = req.user.id;
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: 'Product ID is required' });
      }
      const cart = await cartService.addItem(userId, productId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async updateQuantity(req, res) {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;
      if (!productId || quantity === undefined) {
        return res.status(400).json({ message: 'Product ID and quantity are required' });
      }
      const cart = await cartService.updateQuantity(userId, productId, parseInt(quantity));
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }

  async clearCart(req, res) {
    try {
      const userId = req.user.id;
      const cart = await cartService.clearCart(userId);
      res.json(cart);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = new CartController();
