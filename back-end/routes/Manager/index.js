const express = require('express');
const router = express.Router();

const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const reviewRoutes = require('./reviewRoutes');

// Mount all Product Manager routes
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/reviews', reviewRoutes);

module.exports = router;
