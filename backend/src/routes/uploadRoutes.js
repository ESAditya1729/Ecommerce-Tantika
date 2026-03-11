// backend/routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Test endpoint - Add this!
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload API is working!',
    timestamp: new Date().toISOString()
  });
});

// ✅ CHANGE THIS: '/upload' → '/'
router.post('/', upload.single('image'), async (req, res) => {
  try {
    console.log('📤 Upload request received');
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }

    console.log('📁 File info:', {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    console.log('☁️ Uploading to Cloudinary...');

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'ecommerce/products',
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ]
    });

    console.log('✅ Cloudinary upload successful:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

//For uploading profile pictures - requires authentication
router.post('/pfpupload', protect, upload.single('image'), async (req, res) => {
  try {
    
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        error: 'No file uploaded' 
      });
    }
    const userId = req.user._id;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID not found in token'
      });
    }


    // Convert buffer to base64
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;


    // Upload to Cloudinary with custom filename using userId
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER_PFP,
      public_id: `${userId}-pfp`,
      resource_type: 'auto',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [
        { width: 800, height: 800, crop: 'limit' },
        { quality: 'auto:good' }
      ],
      overwrite: true,
      invalidate: true
    });

    res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      bytes: result.bytes
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Generate signature for secure upload
router.get('/signature', (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp,
      folder: process.env.CLOUDINARY_UPLOAD_FOLDER
    };
    
    const signature = cloudinary.utils.api_sign_request(
      params, 
      process.env.CLOUDINARY_API_SECRET
    );
    
    res.json({
      success: true,
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      folder: params.folder
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// Delete image
router.delete('/:publicId', async (req, res) => {
  try {
    const result = await cloudinary.uploader.destroy(req.params.publicId);
    res.json({ 
      success: true, 
      result 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

module.exports = router;