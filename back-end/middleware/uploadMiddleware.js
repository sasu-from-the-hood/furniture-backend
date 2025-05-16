const { uploadSingle, uploadMultiple } = require('./fileUpload');

/**
 * Middleware to handle single file upload using multer
 * This middleware should be used before processImages middleware
 */
const handleSingleFileUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Error uploading file:', err);
      return res.status(400).json({ message: 'Error uploading file', error: err.message });
    }

    // Continue to next middleware
    next();
  });
};

/**
 * Middleware to handle multiple file uploads using multer (up to 5 files)
 * This middleware should be used before processImages middleware
 */
const handleMultipleFileUpload = (req, res, next) => {
  console.log('Starting multiple file upload middleware');
  console.log('Request headers:', req.headers);

  uploadMultiple(req, res, (err) => {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(400).json({ message: 'Error uploading files', error: err.message });
    }

    console.log('Files received:', req.files ? req.files.length : 0);
    if (req.files && req.files.length > 0) {
      console.log('File details:', req.files.map(f => ({
        fieldname: f.fieldname,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size
      })));
    } else {
      console.log('No files received in the request');
      console.log('Request body keys:', Object.keys(req.body));
    }

    // Continue to next middleware
    next();
  });
};

// For backward compatibility, default to single file upload
const handleFileUpload = handleSingleFileUpload;

module.exports = {
  handleFileUpload,
  handleSingleFileUpload,
  handleMultipleFileUpload
};
