const { Product, ProductImage, Category, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      categoryId,
      search,
      minPrice,
      maxPrice,
      material,
      color,
      inStock,
      featured
    } = req.query;

    const offset = (page - 1) * limit;

    const whereClause = {};

    // Support both 'category' and 'categoryId' parameters for backward compatibility
    if (categoryId) {
      whereClause.categoryId = categoryId;
    } else if (category) {
      whereClause.categoryId = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { shortDesc: { [Op.like]: `%${search}%` } },
        { longDesc: { [Op.like]: `%${search}%` } }
      ];
    }

    if (minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: minPrice };
    }

    if (maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: maxPrice };
    }

    if (material) {
      whereClause.material = material;
    }

    if (color) {
      whereClause.color = color;
    }

    if (inStock !== undefined) {
      whereClause.inStock = inStock === 'true';
    }

    if (featured !== undefined) {
      whereClause.featured = featured === 'true';
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: ProductImage,
          as: 'images',
          required: false,
          where: {
            isPrimary: true
          },
          limit: 1
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      products,
      pagination: {
        total: count,
        totalPages,
        currentPage: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ product });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      shortDesc,
      longDesc,
      price,
      discountPrice = null,
      inStock = true,
      stockQuantity = null,
      installationAvailable = false,
      installationDetails = null,
      categoryId,
      material = null,
      color = null,
      dimensions = null,
      featured = false,
      images
    } = req.body;

    // Generate a unique SKU
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    const sku = `PROD-${timestamp}-${randomNum}`;

    // Check if the generated SKU already exists
    const existingProduct = await Product.findOne({
      where: { sku },
      transaction
    });

    if (existingProduct) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Product with this SKU already exists. Please try again.' });
    }

    const category = await Category.findByPk(categoryId, { transaction });
    if (!category) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    const product = await Product.create({
      title,
      shortDesc,
      longDesc,
      price,
      discountPrice,
      inStock: inStock !== undefined ? inStock : true,
      stockQuantity,
      installationAvailable: installationAvailable !== undefined ? installationAvailable : false,
      installationDetails,
      categoryId,
      material,
      color,
      dimensions,
      sku,
      featured: featured !== undefined ? featured : false,
      isActive: true
    }, { transaction });

    if (images && images.length > 0) {
      const productImages = images.map((image, index) => ({
        productId: product.id,
        imageUrl:"/uploads" +  image.imageUrl,
        altText: image.altText || title,
        isPrimary: image.isPrimary || index === 0,
        displayOrder: image.displayOrder || index
      }));

      await ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();

    const createdProduct = await Product.findByPk(product.id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    res.status(201).json({
      message: 'Product created successfully',
      product: createdProduct
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const {
      title,
      shortDesc,
      longDesc,
      price,
      categoryId,
      isActive,
      images
    } = req.body;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    // We're not allowing SKU updates from the frontend
    // Use the existing SKU from the product

    if (categoryId) {
      const category = await Category.findByPk(categoryId, { transaction });
      if (!category) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Invalid category ID' });
      }
    }

    await product.update({
      title: title || product.title,
      shortDesc: shortDesc || product.shortDesc,
      longDesc: longDesc || product.longDesc,
      price: price || product.price,
      categoryId: categoryId || product.categoryId,
      isActive: isActive !== undefined ? isActive : product.isActive
    }, { transaction });

    if (images && images.length > 0) {
      await ProductImage.destroy({
        where: { productId: id },
        transaction
      });

      const productImages = images.map((image, index) => {
        if (!image.imageUrl || !image.imageUrl.startsWith("/")) {
          return null;
        }

        let imageUrl = image.imageUrl;

        // If imageUrl starts with "/products", add "/uploads" prefix
        if (imageUrl.startsWith("/products")) {
          imageUrl = "/uploads" + imageUrl;
        }

        return {
          productId: product.id,
          imageUrl: imageUrl,
          altText: image.altText || title || product.title,
          isPrimary: index == 1 ? 1 : 0,
          displayOrder: image.displayOrder || index
        };
      }).filter(image => image !== null);

      await ProductImage.bulkCreate(productImages, { transaction });
    }

    await transaction.commit();

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct,
      id: updatedProduct.id
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    await ProductImage.destroy({
      where: { productId: id },
      transaction
    });

    await product.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the deleted product
    const product = await Product.findByPk(id, { paranoid: false });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.deletedAt) {
      return res.status(400).json({ message: 'Product is not deleted' });
    }

    // Restore the product
    await product.restore();

    // Restore associated product images
    await ProductImage.restore({
      where: { productId: id }
    });

    const restoredProduct = await Product.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'category'
        },
        {
          model: ProductImage,
          as: 'images',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    res.json({
      message: 'Product restored successfully',
      product: restoredProduct
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProductImages = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { images } = req.body;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!images || !Array.isArray(images)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Images array is required' });
    }

    await ProductImage.destroy({
      where: { productId: id },
      transaction
    });

    const productImages = images.map((image, index) => {
      // Handle different image formats
      let imageUrl = image.imageUrl;

      // If imageUrl starts with /uploads, remove it to avoid duplication
      if (imageUrl && imageUrl.startsWith('/uploads')) {
        imageUrl = imageUrl.replace('/uploads', '');
      }

      return {
        productId: product.id,
        imageUrl: imageUrl,
        altText: image.altText || product.title,
        isPrimary: image.isPrimary || index === 0,
        displayOrder: image.displayOrder || index
      };
    });

    await ProductImage.bulkCreate(productImages, { transaction });

    await transaction.commit();

    const updatedProduct = await Product.findByPk(id, {
      include: [
        {
          model: ProductImage,
          as: 'images',
          order: [['displayOrder', 'ASC']]
        }
      ]
    });

    res.json({
      message: 'Product images updated successfully',
      images: updatedProduct.images,
      id: product.id
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
