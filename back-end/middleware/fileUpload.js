const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure upload directories exist
const createUploadDirectories = () => {
  const dirs = ['uploads', 'uploads/products'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/products');
  },
  filename: (req, file, cb) => {
    // Generate a unique filename with original extension
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uniqueSuffix}${ext}`);
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('file'); // Use 'file' as the field name - this matches our frontend source="file"

// Handle base64 image data
const saveBase64Image = (base64String, prefix = 'product') => {
  return new Promise((resolve, reject) => {
    try {
      // Create directory if it doesn't exist
      createUploadDirectories();

      // Extract the base64 data and determine file type
      const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);

      if (!matches || matches.length !== 3) {
        return reject(new Error('Invalid base64 string'));
      }

      const type = matches[1];
      const data = matches[2];
      const buffer = Buffer.from(data, 'base64');

      // Determine file extension based on mime type
      let extension;
      switch (type) {
        case 'image/jpeg':
          extension = '.jpg';
          break;
        case 'image/png':
          extension = '.png';
          break;
        case 'image/gif':
          extension = '.gif';
          break;
        case 'image/webp':
          extension = '.webp';
          break;
        default:
          extension = '.jpg';
      }

      // Generate unique filename
      const uniqueSuffix = crypto.randomBytes(8).toString('hex');
      const filename = `${prefix}-${Date.now()}-${uniqueSuffix}${extension}`;
      const filepath = path.join('uploads/products', filename);

      // Write file to disk
      fs.writeFile(filepath, buffer, (err) => {
        if (err) return reject(err);
        resolve(`/uploads/products/${filename}`);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Process raw file from request
const processRawFile = async (file) => {
  try {
    if (!file) return null;

    // Generate a unique filename
    const uniqueSuffix = crypto.randomBytes(8).toString('hex');
    const ext = path.extname(file.originalname || '.jpg');
    const filename = `product-${Date.now()}-${uniqueSuffix}${ext}`;

    // Save the file
    const filepath = path.join('uploads/products', filename);
    fs.writeFileSync(filepath, file.buffer);

    return `/uploads/products/${filename}`;
  } catch (error) {
    console.error('Error processing raw file:', error);
    throw error;
  }
};

module.exports = {
  upload,
  saveBase64Image,
  processRawFile
};
