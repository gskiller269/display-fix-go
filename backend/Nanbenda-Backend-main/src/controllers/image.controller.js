const ImageRepository = require('../repositories/image.repository');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');

const uploadImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'No image file uploaded'));
  }

  const subDir = req.file.destination.includes('uploads/') 
    ? req.file.destination.split('uploads/')[1] 
    : req.file.destination;
  
  // Ensure subDir doesn't end with a slash and filename starts with one, or vice versa
  const normalizedSubDir = subDir.replace(/\/$/, '');
  const imageUrl = `/uploads/${normalizedSubDir}/${req.file.filename}`.replace(/\/+/g, '/');
  
  const image = await ImageRepository.create(req.file.originalname, imageUrl);

  res.status(201).json(new ApiResponse(201, image, 'Image uploaded successfully'));
});

const getImages = asyncHandler(async (req, res) => {
  const images = await ImageRepository.getAll();
  res.json(new ApiResponse(200, images, 'Images fetched successfully'));
});

module.exports = {
  uploadImage,
  getImages
};
