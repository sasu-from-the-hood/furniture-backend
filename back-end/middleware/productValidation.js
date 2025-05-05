exports.validateCreateProduct = (req, res, next) => {
  const {
    title,
    shortDesc,
    longDesc,
    price,
    categoryId,
    sku
  } = req.body;
  
  if (!title || !shortDesc || !longDesc || !price || !categoryId || !sku) {
    return res.status(400).json({ 
      message: 'Required fields missing', 
      required: ['title', 'shortDesc', 'longDesc', 'price', 'categoryId', 'sku'] 
    });
  }
  
  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  
  if (req.body.discountPrice && (isNaN(parseFloat(req.body.discountPrice)) || parseFloat(req.body.discountPrice) <= 0)) {
    return res.status(400).json({ message: 'Discount price must be a positive number' });
  }
  
  if (req.body.stockQuantity && (isNaN(parseInt(req.body.stockQuantity)) || parseInt(req.body.stockQuantity) < 0)) {
    return res.status(400).json({ message: 'Stock quantity must be a non-negative integer' });
  }
  
  if (req.body.images) {
    if (!Array.isArray(req.body.images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }
    
    for (const image of req.body.images) {
      if (!image.imageUrl) {
        return res.status(400).json({ message: 'Each image must have an imageUrl' });
      }
    }
  }
  
  next();
};

exports.validateUpdateProduct = (req, res, next) => {
  const { price, discountPrice, stockQuantity, images } = req.body;
  
  if (price && (isNaN(parseFloat(price)) || parseFloat(price) <= 0)) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }
  
  if (discountPrice !== undefined && discountPrice !== null && (isNaN(parseFloat(discountPrice)) || parseFloat(discountPrice) <= 0)) {
    return res.status(400).json({ message: 'Discount price must be a positive number' });
  }
  
  if (stockQuantity !== undefined && (isNaN(parseInt(stockQuantity)) || parseInt(stockQuantity) < 0)) {
    return res.status(400).json({ message: 'Stock quantity must be a non-negative integer' });
  }
  
  if (images) {
    if (!Array.isArray(images)) {
      return res.status(400).json({ message: 'Images must be an array' });
    }
    
    for (const image of images) {
      if (!image.imageUrl) {
        return res.status(400).json({ message: 'Each image must have an imageUrl' });
      }
    }
  }
  
  next();
};

exports.validateProductImages = (req, res, next) => {
  const { images } = req.body;
  
  if (!images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ message: 'Images array is required and cannot be empty' });
  }
  
  for (const image of images) {
    if (!image.imageUrl) {
      return res.status(400).json({ message: 'Each image must have an imageUrl' });
    }
  }
  
  next();
};
