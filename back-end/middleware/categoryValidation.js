exports.validateCreateCategory = (req, res, next) => {
  const { name } = req.body;
  
  if (!name) {
    return res.status(400).json({ message: 'Category name is required' });
  }
  
  if (req.body.filters) {
    if (!isValidFilters(req.body.filters)) {
      return res.status(400).json({ message: 'Invalid filters format' });
    }
  }
  
  next();
};

exports.validateUpdateCategory = (req, res, next) => {
  if (req.body.filters) {
    if (!isValidFilters(req.body.filters)) {
      return res.status(400).json({ message: 'Invalid filters format' });
    }
  }
  
  next();
};

exports.validateCategoryFilters = (req, res, next) => {
  const { filters } = req.body;
  
  if (!filters) {
    return res.status(400).json({ message: 'Filters are required' });
  }
  
  if (!isValidFilters(filters)) {
    return res.status(400).json({ message: 'Invalid filters format' });
  }
  
  next();
};

function isValidFilters(filters) {
  // Check if filters is an object
  if (typeof filters !== 'object' || filters === null) {
    return false;
  }
  
  // Check if required properties exist
  if (!('material' in filters) || !('color' in filters) || !('priceRange' in filters)) {
    return false;
  }
  
  // Check if material and color are arrays
  if (!Array.isArray(filters.material) || !Array.isArray(filters.color)) {
    return false;
  }
  
  // Check if priceRange is an object with min and max properties
  if (typeof filters.priceRange !== 'object' || 
      !('min' in filters.priceRange) || 
      !('max' in filters.priceRange)) {
    return false;
  }
  
  // Check if min and max are numbers or null
  const { min, max } = filters.priceRange;
  if ((min !== null && typeof min !== 'number') || 
      (max !== null && typeof max !== 'number')) {
    return false;
  }
  
  return true;
}
