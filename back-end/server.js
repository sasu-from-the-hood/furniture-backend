require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration
app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true);
    const allowedOrigins = [
      'http://localhost:5174',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5174'
    ];

    if(allowedOrigins.indexOf(origin) !== -1) {
      callback(null, origin);
    } else {
      callback(null, allowedOrigins[0]);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Serve static files from the uploads directory with improved configuration
app.use('/uploads', express.static('uploads', {
  // Set proper cache control for better performance
  maxAge: '1d',
  // Set appropriate headers
  setHeaders: (res, path) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Set cache control headers
    res.setHeader('Cache-Control', 'public, max-age=86400');

    // Set appropriate content type based on file extension
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.setHeader('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

const authRoutes = require('./routes/authRoutes');
const superAdminRoutes = require('./routes/SuperAdmin/index');
const productManagerRoutes = require('./routes/Manager/index');
const salesAdminRoutes = require('./routes/Sales/index');
const userReviewRoutes = require('./routes/userReviewRoutes');
const userRoutes = require('./routes/user/index');
const chapaRoutes = require('./routes/payment/chapaRoutes');

// Import file upload middleware
const { handleSingleFileUpload } = require('./middleware/uploadMiddleware');

// Direct file upload route for testing or general use
app.post('/api/upload', handleSingleFileUpload, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Create URL for the uploaded file
    const fileUrl = `/uploads/products/${req.file.filename}`;

    // Return success response with file details
    return res.status(200).json({
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Error in file upload route:', error);
    return res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/superadmin', superAdminRoutes);
app.use('/api/manager', productManagerRoutes);
app.use('/api/sales', salesAdminRoutes);
app.use('/api/reviews', userReviewRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment/chapa', chapaRoutes);


app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
});

module.exports = app;
