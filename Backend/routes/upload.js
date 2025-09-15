const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    if (
      file.mimetype === "image/png" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/gif" ||
      file.mimetype === "application/pdf"
    ) { cb(null, true); } 
    else { cb(new Error("Only images and PDFs allowed"), false); }
  }
});

// Auth middleware optional, if you want protected
// const { authenticateToken } = require('../middleware/auth');

router.post('/', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    res.json({
      success: true,
      url: req.file.path,
      public_id: req.file.filename,
      originalName: req.file.originalname,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message || 'Internal error' });
  }
});

module.exports = router;
