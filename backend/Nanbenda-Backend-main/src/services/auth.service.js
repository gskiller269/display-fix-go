const AuthRepository = require('../repositories/auth.repository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { JWT_SECRET } = require('../config');

class AuthService {
  async register(userData) {
    const { username, mobile_number, password } = userData;

    if (username) {
      const existingByUsername = await AuthRepository.findByUsername(username);
      if (existingByUsername) {
        throw new Error('Username already exists');
      }
    }

    const existing = await AuthRepository.findByMobileNumber(mobile_number);
    if (existing) {
      throw new Error('User with this mobile number already exists');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await AuthRepository.create({ ...userData, password: hashedPassword });
  }

  async login(identifier, password) {
    const user = await AuthRepository.findByUsernameOrMobile(identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, mobile: user.mobile_number },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    delete user.password;
    return { token, user };
  }

  async getProfile(userId) {
    const user = await AuthRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    delete user.password;
    return user;
  }

  async updateProfile(userId, profileData) {
    const updated = await AuthRepository.updateProfile(userId, profileData);
    if (!updated) {
      throw new Error('Failed to update profile');
    }
    return await this.getProfile(userId);
  }

  async updateProfileImage(userId, imageUrl) {
    // Get current user profile to find old image
    const user = await AuthRepository.findById(userId);

    // If user has an old image, delete it from the server
    if (user && user.profile_image_url) {
      // The stored URL is like /uploads/profiles/1.png
      // We need to map it to the actual file path on the server
      const oldImagePath = path.join(__dirname, '../../', user.profile_image_url);

      // Basic check: don't delete if the new path is same as old path
      // (Though with different extensions or multer config this might be different)
      const newImagePath = path.join(__dirname, '../../', imageUrl);

      if (oldImagePath !== newImagePath && fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error(`Failed to delete old profile image: ${oldImagePath}`, err);
        }
      }
    }

    const updated = await AuthRepository.updateProfileImage(userId, imageUrl);
    if (!updated) {
      throw new Error('Failed to update profile image');
    }
    return imageUrl;
  }

  async updateStatus(userId, status) {
    const updated = await AuthRepository.updateStatus(userId, status);
    if (!updated) {
      throw new Error('Failed to update status');
    }
    return await this.getProfile(userId);
  }

  async getAllUsers(role) {
    return await AuthRepository.getAll(role);
  }
}

module.exports = new AuthService();
