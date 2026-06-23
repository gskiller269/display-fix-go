const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'uploads/';
    
    if (file.fieldname === 'profile_image' || file.fieldname === 'profileImage') {
      uploadPath += 'profiles/';
    } else if (file.fieldname === 'images') {
      if (req.originalUrl.includes('/products')) {
        uploadPath += 'products/';
      } else {
        uploadPath += 'repairs/';
      }
    } else if (file.fieldname === 'shop_image') {
      uploadPath += 'shops/';
    } else if (file.fieldname === 'image') {
      uploadPath += 'common_issues/';
    }
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const userId = req.user ? req.user.id : 'anon';
    let ext = path.extname(file.originalname).toLowerCase();
    
    // If no extension found, try to guess from mimetype or default to .jpg
    if (!ext) {
      if (file.mimetype === 'image/png') ext = '.png';
      else if (file.mimetype === 'image/webp') ext = '.webp';
      else ext = '.jpg';
    }
    
    if (file.fieldname === 'profile_image' || file.fieldname === 'profileImage') {
      cb(null, `${userId}${ext}`);
    } else if (file.fieldname === 'shop_image') {
      cb(null, `shop-${userId}-${uniqueSuffix}${ext}`);
    } else {
      cb(null, `${userId}-${uniqueSuffix}${ext}`);
    }
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // console.log('File upload attempt:', { mimetype: file.mimetype, originalname: file.originalname });
    
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    // If it's an image mimetype but extension is missing (common in some web/mobile cases), we allow it
    if (mimetype && (extname || file.originalname === 'blob')) {
      return cb(null, true);
    }
    
    // Fallback: Check if mimetype starts with image/
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }

    cb(new Error('Only images are allowed!'));
  }
});

module.exports = upload;
