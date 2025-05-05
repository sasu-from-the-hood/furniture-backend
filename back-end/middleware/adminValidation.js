exports.validateCreateAdmin = (req, res, next) => {
  const { name, email, password, roleId } = req.body;
  
  if (!name || !email || !password || !roleId) {
    return res.status(400).json({ message: 'Name, email, password, and roleId are required' });
  }
  
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }
  
  next();
};

exports.validateUpdateAdmin = (req, res, next) => {
  const { email } = req.body;
  
  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
  }
  
  next();
};
