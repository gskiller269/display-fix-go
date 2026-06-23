const productService = require('../services/product.service');
const imageRepository = require('../repositories/image.repository');
const shopService = require('../services/shop.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const typeId = req.query.typeId || null;
  const lat = req.query.lat ? parseFloat(req.query.lat) : null;
  const lng = req.query.lng ? parseFloat(req.query.lng) : null;

  let products;
  let shopInfo = null;

  if (lat && lng) {
    // Get nearest active shop
    const [nearestShop] = await require('../config').db.execute(`
      SELECT *, (
        6371 * acos (
          cos ( radians(?) )
          * cos( radians( latitude ) )
          * cos( radians( longitude ) - radians(?) )
          + sin ( radians(?) )
          * sin( radians( latitude ) )
        )
      ) AS distance
      FROM shops
      WHERE status = 'active'
      ORDER BY distance ASC
      LIMIT 1
    `, [lat, lng, lat]);

    if (nearestShop && nearestShop.length > 0) {
      const shop = nearestShop[0];
      shopInfo = { id: shop.id, shop_name: shop.shop_name, distance: shop.distance };
      products = await productService.getProductsByShopId(shop.id, page, limit);
    } else {
      products = [];
    }
  } else {
    products = await productService.getAllProducts(page, limit, typeId);
  }

  res.json(new ApiResponse(200, { products, shop: shopInfo }, "Products fetched successfully"));
});


const getShopProducts = asyncHandler(async (req, res) => {
  if (!req.user || req.user.role !== 'shop_owner') {
    return res.status(403).json(new ApiResponse(403, null, "Only shop owners can access this"));
  }
  
  const shop = await shopService.getMyShop(req.user.id);
  if (!shop) {
    return res.status(404).json(new ApiResponse(404, null, "No shop found for this owner"));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getProductsByShopId(shop.id, page, limit);
  res.json(new ApiResponse(200, products, "Shop products fetched successfully"));
});

const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts();
  res.json(new ApiResponse(200, products, "Featured products fetched successfully"));
});

const getBestSellers = asyncHandler(async (req, res) => {
  const products = await productService.getBestSellers();
  res.json(new ApiResponse(200, products, "Best selling products fetched successfully"));
});

const getMostClickedProducts = asyncHandler(async (req, res) => {
  const products = await productService.getMostClickedProducts();
  res.json(new ApiResponse(200, products, "Most clicked products fetched successfully"));
});

const getRandomProducts = asyncHandler(async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit) : 6;
  const products = await productService.getRandomProducts(limit);
  res.json(new ApiResponse(200, products, "Random products fetched successfully"));
});

const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.getProductById(id);
  if (!product) {
    return res.status(404).json(new ApiResponse(404, null, "Product not found"));
  }
  res.json(new ApiResponse(200, product, "Product fetched successfully"));
});

const getBrands = asyncHandler(async (req, res) => {
  const brands = await productService.getBrands();
  res.json(new ApiResponse(200, brands, "Brands fetched successfully"));
});

const getModelsByBrand = asyncHandler(async (req, res) => {
  const { brand } = req.query;
  if (!brand) {
    return res.status(400).json(new ApiResponse(400, null, "Brand query parameter is required"));
  }
  const models = await productService.getModelsByBrand(brand);
  res.json(new ApiResponse(200, models, "Models fetched successfully"));
});

const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body };
  
  // Handle shop_id and active_by based on role
  if (req.user && req.user.role === 'shop_owner') {
    const shop = await shopService.getMyShop(req.user.id);
    if (shop) {
      productData.shop_id = shop.id;
      productData.active_by = 'shopowner';
    } else {
      return res.status(400).json(new ApiResponse(400, null, "You must have a registered shop to add products"));
    }
  } else {
    // Admin or other roles
    productData.shop_id = productData.shop_id || null;
    productData.active_by = req.user?.role === 'admin' ? 'admin' : 'shopowner';
  }

  // Handle uploaded images
  if (req.files && req.files.length > 0) {
    const imageIds = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/products/${file.filename}`;
      const image = await imageRepository.create(file.originalname, imageUrl);
      imageIds.push(image.id);
    }
    productData.image_ids = imageIds.join(',');
  }

  try {
    const product = await productService.createProduct(productData);
    res.status(201).json(new ApiResponse(201, product, "Product created successfully"));
  } catch (error) {
    console.error("Product creation failed:", error);
    res.status(500).json(new ApiResponse(500, null, error.message || "Failed to create product"));
  }
});

const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const productData = { ...req.body };

  // Security Check for Shop Owners
  if (req.user && req.user.role === 'shop_owner') {
    const existingProduct = await productService.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    
    const shop = await shopService.getMyShop(req.user.id);
    if (!shop || existingProduct.shop_id !== shop.id) {
      return res.status(403).json(new ApiResponse(403, null, "Unauthorized: You can only edit your own products"));
    }

    // Force shop ownership and attribution metadata
    productData.shop_id = shop.id;
    productData.active_by = 'shopowner';
  }

  // Handle newly uploaded images
  if (req.files && req.files.length > 0) {
    const newImageIds = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/products/${file.filename}`;
      const image = await imageRepository.create(file.originalname, imageUrl);
      newImageIds.push(image.id);
    }
    
    // Merge new image IDs with kept existing ones
    // Note: productData.image_ids should contain IDs of existing images the user wants to KEEP
    const keptIds = productData.image_ids ? productData.image_ids.split(',').filter(Boolean) : [];
    productData.image_ids = [...keptIds, ...newImageIds].join(',');
  }

  const success = await productService.updateProduct(id, productData);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Product not found or no changes made"));
  }
  res.json(new ApiResponse(200, { id, ...productData }, "Product updated successfully"));
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Security Check for Shop Owners
  if (req.user && req.user.role === 'shop_owner') {
    const existingProduct = await productService.getProductById(id);
    if (!existingProduct) {
      return res.status(404).json(new ApiResponse(404, null, "Product not found"));
    }
    
    const shop = await shopService.getMyShop(req.user.id);
    if (!shop || existingProduct.shop_id !== shop.id) {
      return res.status(403).json(new ApiResponse(403, null, "Unauthorized: You can only delete your own products"));
    }
  }

  const success = await productService.deleteProduct(id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Product not found"));
  }
  res.json(new ApiResponse(200, null, "Product deleted successfully"));
});

const incrementClicks = asyncHandler(async (req, res) => {
  await productService.incrementClicks(req.params.id);
  res.json(new ApiResponse(200, null, "Click incremented successfully"));
});

const getProductsByShop = asyncHandler(async (req, res) => {
  const { shopId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const products = await productService.getProductsByShopId(shopId, page, limit);
  res.json(new ApiResponse(200, products, "Shop products fetched successfully"));
});


module.exports = {
  getAllProducts,
  getFeaturedProducts,
  getBestSellers,
  getMostClickedProducts,
  getRandomProducts,
  getProductById,
  getBrands,
  getModelsByBrand,
  getShopProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  incrementClicks,
  getProductsByShop
};
