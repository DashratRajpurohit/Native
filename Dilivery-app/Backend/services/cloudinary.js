const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadImage = async (filePath) => {
  const filename = path.basename(filePath);
  const relativeUrl = `/uploads/${filename}`;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    console.log('⚠️ Cloudinary not configured. Using local relative file path:', relativeUrl);
    return relativeUrl;
  }

  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'delivery chacker',
    });
    return result.secure_url;
  } catch (error) {
    console.warn('⚠️ Cloudinary Upload Error, falling back to local storage:', error.message);
    return relativeUrl;
  }
};

module.exports = { uploadImage, cloudinary };
