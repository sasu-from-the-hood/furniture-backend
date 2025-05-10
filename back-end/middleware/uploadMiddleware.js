const { upload } = require('./fileUpload');

/**
 * Middleware to handle file uploads using multer
 * This middleware should be used before processImages middleware
 */
const handleFileUpload = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }
    
    // Continue to next middleware
    next();
  });
};

module.exports = handleFileUpload;
