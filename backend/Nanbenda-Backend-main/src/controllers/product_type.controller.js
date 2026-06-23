const productTypeService = require('../services/product_type.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const getAllProductTypes = asyncHandler(async (req, res) => {
  const productTypes = await productTypeService.getAllProductTypes();
  res.json(new ApiResponse(200, productTypes, "Product types fetched successfully"));
});

const createProductType = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const productType = await productTypeService.createProductType(name);
  res.status(201).json(new ApiResponse(201, productType, "Product type created successfully"));
});

const updateProductType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const success = await productTypeService.updateProductType(id, name);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Product type not found"));
  }
  res.json(new ApiResponse(200, { id, name }, "Product type updated successfully"));
});

const deleteProductType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const success = await productTypeService.deleteProductType(id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, "Product type not found"));
  }
  res.json(new ApiResponse(200, null, "Product type deleted successfully"));
});

module.exports = {
  getAllProductTypes,
  createProductType,
  updateProductType,
  deleteProductType
};
