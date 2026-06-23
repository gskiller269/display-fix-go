const AuthService = require('../services/auth.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/apiResponse');
const { processImage } = require('../utils/imageProcessor');

const register = asyncHandler(async (req, res) => {
  const user = await AuthService.register(req.body);
  const result = await AuthService.login(user.username || user.mobile_number, req.body.password);
  return res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

const registerTechnician = asyncHandler(async (req, res) => {
  const userData = {
    username: req.body.username,
    email: req.body.email,
    mobile_number: req.body.mobile_number,
    password: req.body.password,
    shop_id: req.body.shop_id || null,
    role: 'technician'
  };

  const user = await AuthService.register(userData);

  if (req.files && req.files['profileImage']) {
    const file = req.files['profileImage'][0];
    await processImage(file.path, 800, 75);
    const imageUrl = `/uploads/profiles/${file.filename}`;
    await AuthService.updateProfileImage(user.id, imageUrl);
    user.profile_image_url = imageUrl;
  }

  return res.status(201).json(new ApiResponse(201, user, 'Technician registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { identifier, password } = req.body;
  const result = await AuthService.login(identifier, password);
  return res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

const getProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.getProfile(req.user.id);
  return res.status(200).json(new ApiResponse(200, user, 'Profile fetched successfully'));
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await AuthService.updateProfile(req.user.id, req.body);
  return res.status(200).json(new ApiResponse(200, user, 'Profile updated successfully'));
});

const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(400, null, 'No file uploaded'));
  }

  // Auto compress image
  await processImage(req.file.path, 800, 75);

  const imageUrl = `/uploads/profiles/${req.file.filename}`;
  await AuthService.updateProfileImage(req.user.id, imageUrl);
  return res.status(200).json(new ApiResponse(200, { imageUrl }, 'Profile image updated successfully'));
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;
  const users = await AuthService.getAllUsers(role);
  return res.status(200).json(new ApiResponse(200, users, 'Users fetched successfully'));
});

const updateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json(new ApiResponse(400, null, 'Status is required'));
  }
  const user = await AuthService.updateStatus(req.user.id, status);
  return res.status(200).json(new ApiResponse(200, user, 'Status updated successfully'));
});

module.exports = {
  register,
  registerTechnician,
  login,
  getProfile,
  updateProfile,
  updateProfileImage,
  getAllUsers,
  updateStatus
};
