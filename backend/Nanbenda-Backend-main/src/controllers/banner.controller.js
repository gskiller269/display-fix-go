const bannerService = require('../services/banner.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const imageRepository = require('../repositories/image.repository');

const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await bannerService.getActiveBanners();
  res.json(new ApiResponse(200, banners, 'Banners fetched successfully'));
});

const getBannerById = asyncHandler(async (req, res) => {
  const banner = await bannerService.getBannerById(req.params.id);
  if (!banner) {
    return res.status(404).json(new ApiResponse(404, null, 'Banner not found'));
  }
  res.json(new ApiResponse(200, banner, 'Banner fetched successfully'));
});

const createBanner = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  let image_id = null;

  if (req.file) {
    const imageUrl = `uploads/${req.file.filename}`;
    const image = await imageRepository.create(req.file.originalname, imageUrl);
    image_id = image.id;
  }

  const banner = await bannerService.createBanner({ title, description, image_id });
  res.status(201).json(new ApiResponse(201, banner, 'Banner created successfully'));
});

const updateBanner = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  let bannerData = { title, description };

  if (req.file) {
    const imageUrl = `uploads/${req.file.filename}`;
    const image = await imageRepository.create(req.file.originalname, imageUrl);
    bannerData.image_id = image.id;
  }

  const success = await bannerService.updateBanner(req.params.id, bannerData);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, 'Banner not found or no changes made'));
  }
  res.json(new ApiResponse(200, { id: req.params.id, ...bannerData }, 'Banner updated successfully'));
});

const deleteBanner = asyncHandler(async (req, res) => {
  const success = await bannerService.deleteBanner(req.params.id);
  if (!success) {
    return res.status(404).json(new ApiResponse(404, null, 'Banner not found'));
  }
  res.json(new ApiResponse(200, null, 'Banner deleted successfully'));
});

module.exports = {
  getActiveBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};
