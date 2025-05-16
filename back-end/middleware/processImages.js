// No imports needed

/**
 * Middleware to process images from file uploads
 * This middleware should be used after multer middleware
 */
const processImages = async (req, res, next) => {
  try {
    // Create images array if it doesn't exist
    if (!req.body.images) {
      req.body.images = [];
    }

    // If images is not an array, make it one
    if (!Array.isArray(req.body.images)) {
      req.body.images = [req.body.images];
    }

    // Check if we have multiple files from multer
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      console.log('Processing multiple files in processImages middleware');

      // Process each file in the array
      req.files.forEach((file, index) => {
        // Create a URL for the uploaded file - without duplicate 'uploads' prefix
        const imageUrl = `/products/${file.filename}`;
        console.log(`Processing file ${index + 1}:`, file.originalname, imageUrl);

        // Add the processed image to the array
        req.body.images.push({
          imageUrl,
          title: file.originalname || `Uploaded image ${index + 1}`,
          isPrimary: index === 0 && req.body.images.length === 0 // First image is primary
        });
      });
    }
    // Check if we have a single file from multer
    else if (req.file) {
      // Create a URL for the uploaded file - without duplicate 'uploads' prefix
      const imageUrl = `/products/${req.file.filename}`;

      // Add the processed image to the array
      req.body.images.push({
        imageUrl,
        title: req.file.originalname || 'Uploaded image',
        isPrimary: req.body.images.length === 0 // First image is primary
      });
    }

    // If there are no images at this point but we're updating a product,
    // we'll keep the existing images in the database
    if (!req.body.images || !req.body.images.length) {
      req.body.images = [];
    }

    next();
  } catch (error) {
    console.error('Error processing images:', error);
    return res.status(500).json({ message: 'Error processing images', error: error.message });
  }
};

module.exports = processImages;
