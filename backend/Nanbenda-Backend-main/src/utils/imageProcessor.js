const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Compresses an image at a given path.
 * Replaces the original image with the compressed one.
 * @param {string} filePath - Absolute path to the file
 * @param {number} maxWidth - Max width for resizing (default 1000)
 * @param {number} quality - Compression quality 1-100 (default 80)
 */
const processImage = async (filePath, maxWidth = 1000, quality = 80) => {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found for compression: ${filePath}`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const tempPath = `${filePath}_temp${ext}`;

    // Create a compressed version in a temp file
    let pipeline = sharp(filePath);

    // Get metadata to check dimensions
    const metadata = await pipeline.metadata();

    if (metadata.width > maxWidth) {
      pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
    }

    // Compress based on extension
    if (ext === '.jpg' || ext === '.jpeg') {
      await pipeline.jpeg({ quality, mozjpeg: true }).toFile(tempPath);
    } else if (ext === '.png') {
      await pipeline.png({ quality: Math.floor(quality * 0.8), compressionLevel: 9 }).toFile(tempPath);
    } else if (ext === '.webp') {
      await pipeline.webp({ quality }).toFile(tempPath);
    } else {
      // For other formats, just convert to jpeg
      await pipeline.jpeg({ quality }).toFile(tempPath);
    }

    // Replace original with compressed temp file
    fs.unlinkSync(filePath);
    fs.renameSync(tempPath, filePath);

    // console.log(`Image compressed successfully: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`Error processing image ${filePath}:`, error.message);
    // If temp file exists but failed, clean it up
    const ext = path.extname(filePath).toLowerCase();
    const tempPath = `${filePath}_temp${ext}`;
    if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
  }
};

module.exports = { processImage };
