exports.validateCreateProduct = (req, res, next) => {
  const {
    title,
    shortDesc,
    longDesc,
    price,
    categoryId,
    sku
  } = req.body;

  if (!title || !shortDesc || !longDesc || !price || !categoryId) {
    return res.status(400).json({
      message: 'Required fields missing',
      required: ['title', 'shortDesc', 'longDesc', 'price', 'categoryId', 'sku']
    });
  }

  if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    return res.status(400).json({ message: 'Price must be a positive number' });
  }


  if (req.body.images) {
    // Check if images is an array
    if (!Array.isArray(req.body.images)) {
      // If it's a single object, convert it to an array
      if (typeof req.body.images === 'object') {
        req.body.images = [req.body.images];
      } else {
        return res.status(400).json({ message: 'Images must be an array or object' });
      }
    }

    // Simplify image processing - just mark files that need processing
    req.body.images = req.body.images.map(image => {
      // If image already has imageUrl, return it as is
      if (image.imageUrl) {
        return { ...image, needsProcessing: false };
      }

      // If image has rawFile, mark for processing
      if (image.rawFile) {
        return {
          ...image,
          needsProcessing: true
        };
      }

      // If none of the above, return with a placeholder
      return { ...image, imageUrl: 'placeholder-image-url', needsProcessing: false };
    });
  }

  next();
};

exports.validateUpdateProduct = (req, res, next) => {
  const { price } = req.body;

  if (price !== undefined) {
    if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
  }

  next();
};

exports.validateProductImages = (req, res, next) => {
  const { images } = req.body;

  if (!images) {
    return res.status(400).json({ message: 'Images are required' });
  }

  // Check if images is an array
  if (!Array.isArray(images)) {
    // If it's a single object, convert it to an array
    if (typeof images === 'object') {
      req.body.images = [images];
    } else {
      return res.status(400).json({ message: 'Images must be an array or object' });
    }
  } else if (images.length === 0) {
    return res.status(400).json({ message: 'Images array cannot be empty' });
  } else {
    req.body.images = images;
  }

  // Simplify image processing - just mark files that need processing
  req.body.images = req.body.images.map(image => {
    // If image already has imageUrl, return it as is
    if (image.imageUrl) {
      return { ...image, needsProcessing: false };
    }

    // If image has rawFile, mark for processing
    if (image.rawFile) {
      return {
        ...image,
        needsProcessing: true
      };
    }

    // If none of the above, return with a placeholder
    return { ...image, imageUrl: 'placeholder-image-url', needsProcessing: false };
  });

  next();
};
