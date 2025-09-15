const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Make UNIQUE name: original-no-ext + _ + timestamp + _ + random + .ext
    const originalName = file.originalname.split('.')[0].replace(/\s+/g, '_').toLowerCase();
    const ext = file.mimetype === "application/pdf" ? "pdf" : "png";
    const timestamp = Date.now();
    const randomStr = Math.floor(Math.random() * 1e7);
    return {
      folder: 'farmer-bills',
      public_id: `${originalName}_${timestamp}_${randomStr}`,
      resource_type: 'auto',
      format: ext, // Let Cloudinary pick proper extension
    };
  },
});
module.exports = { cloudinary, storage };
