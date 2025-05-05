const { Product, ProductImage, Category, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.getAllProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
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

    if (category) {
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
      discountPrice,
      inStock,
      stockQuantity,
      installationAvailable,
      installationDetails,
      categoryId,
      material,
      color,
      dimensions,
      sku,
      featured,
      images
    } = req.body;

    const existingProduct = await Product.findOne({
      where: { sku },
      transaction
    });

    if (existingProduct) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Product with this SKU already exists' });
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
        imageUrl: image.imageUrl,
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
      discountPrice,
      inStock,
      stockQuantity,
      installationAvailable,
      installationDetails,
      categoryId,
      material,
      color,
      dimensions,
      sku,
      featured,
      isActive,
      images
    } = req.body;

    const product = await Product.findByPk(id, { transaction });

    if (!product) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Product not found' });
    }

    if (sku && sku !== product.sku) {
      const existingProduct = await Product.findOne({
        where: {
          sku,
          id: { [Op.ne]: id }
        },
        transaction
      });

      if (existingProduct) {
        await transaction.rollback();
        return res.status(400).json({ message: 'Product with this SKU already exists' });
      }
    }

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
      discountPrice: discountPrice !== undefined ? discountPrice : product.discountPrice,
      inStock: inStock !== undefined ? inStock : product.inStock,
      stockQuantity: stockQuantity !== undefined ? stockQuantity : product.stockQuantity,
      installationAvailable: installationAvailable !== undefined ? installationAvailable : product.installationAvailable,
      installationDetails: installationDetails !== undefined ? installationDetails : product.installationDetails,
      categoryId: categoryId || product.categoryId,
      material: material !== undefined ? material : product.material,
      color: color !== undefined ? color : product.color,
      dimensions: dimensions || product.dimensions,
      sku: sku || product.sku,
      featured: featured !== undefined ? featured : product.featured,
      isActive: isActive !== undefined ? isActive : product.isActive
    }, { transaction });

    if (images && images.length > 0) {
      await ProductImage.destroy({
        where: { productId: id },
        transaction
      });

      const productImages = images.map((image, index) => ({
        productId: product.id,
        imageUrl: image.imageUrl,
        altText: image.altText || title || product.title,
        isPrimary: image.isPrimary || index === 0,
        displayOrder: image.displayOrder || index
      }));

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
      product: updatedProduct
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

    const productImages = images.map((image, index) => ({
      productId: product.id,
      imageUrl: image.imageUrl,
      altText: image.altText || product.title,
      isPrimary: image.isPrimary || index === 0,
      displayOrder: image.displayOrder || index
    }));

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
      images: updatedProduct.images
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
