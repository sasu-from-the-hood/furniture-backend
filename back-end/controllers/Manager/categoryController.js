const { Category, Product, sequelize } = require('../../models');
const { Op } = require('sequelize');

exports.getAllCategories = async (req, res) => {
  try {
    const { includeInactive, parentId } = req.query;

    const whereClause = {};

    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    if (parentId === 'null') {
      whereClause.parentId = null;
    } else if (parentId) {
      whereClause.parentId = parentId;
    }

    const categories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: includeInactive !== 'true' ? { isActive: true } : {},
          required: false
        }
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: Category, as: 'subcategories' }, 'displayOrder', 'ASC'],
        [{ model: Category, as: 'subcategories' }, 'name', 'ASC']
      ]
    });

    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if this is a getMany request (comma-separated IDs)
    if (id && id.includes(',')) {
      // Handle getMany request
      const ids = id.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));

      if (ids.length === 0) {
        return res.status(400).json({ message: 'Invalid category IDs' });
      }

      const categories = await Category.findAll({
        where: {
          id: {
            [Op.in]: ids
          }
        },
        include: [
          {
            model: Category,
            as: 'subcategories',
            include: [
              {
                model: Category,
                as: 'subcategories'
              }
            ]
          },
          {
            model: Category,
            as: 'parent'
          }
        ]
      });

      // Return in the format expected by react-admin for getMany
      return res.json({ data: categories });
    }

    // Handle getOne request (single ID)
    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          include: [
            {
              model: Category,
              as: 'subcategories'
            }
          ]
        },
        {
          model: Category,
          as: 'parent'
        }
      ]
    });

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const {
      name,
      description,
      parentId,
      filters,
      isActive,
      displayOrder
    } = req.body;

    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = await Category.create({
      name,
      description,
      parentId: parentId || null,
      filters: filters || {
        material: [],
        color: [],
        priceRange: {
          min: null,
          max: null
        }
      },
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0
    });

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      parentId,
      filters,
      isActive,
      displayOrder
    } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (parentId && parentId !== category.parentId) {
      // Check if the new parent exists
      if (parentId !== null) {
        const parentCategory = await Category.findByPk(parentId);
        if (!parentCategory) {
          return res.status(400).json({ message: 'Parent category not found' });
        }
      }

      // Check if the new parent is not one of this category's descendants
      if (parentId !== null) {
        const isDescendant = await isDescendantOf(parentId, id);
        if (isDescendant) {
          return res.status(400).json({ message: 'Cannot set a descendant as parent' });
        }
      }
    }

    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      parentId: parentId !== undefined ? parentId : category.parentId,
      filters: filters || category.filters,
      isActive: isActive !== undefined ? isActive : category.isActive,
      displayOrder: displayOrder !== undefined ? displayOrder : category.displayOrder
    });

    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories'
        },
        {
          model: Category,
          as: 'parent'
        }
      ]
    });

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories'
        }
      ],
      transaction
    });

    if (!category) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has products
    const productCount = await Product.count({
      where: { categoryId: id },
      transaction
    });

    if (productCount > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Cannot delete category with products',
        productCount
      });
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      await transaction.rollback();
      return res.status(400).json({
        message: 'Cannot delete category with subcategories',
        subcategoryCount: category.subcategories.length
      });
    }

    await category.destroy({ transaction });

    await transaction.commit();

    res.json({
      message: 'Category deleted successfully'
    });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getCategoryTree = async (req, res) => {
  try {
    const { includeInactive } = req.query;

    const whereClause = {
      parentId: null
    };

    if (includeInactive !== 'true') {
      whereClause.isActive = true;
    }

    const rootCategories = await Category.findAll({
      where: whereClause,
      include: [
        {
          model: Category,
          as: 'subcategories',
          where: includeInactive !== 'true' ? { isActive: true } : {},
          required: false,
          include: [
            {
              model: Category,
              as: 'subcategories',
              where: includeInactive !== 'true' ? { isActive: true } : {},
              required: false
            }
          ]
        }
      ],
      order: [
        ['displayOrder', 'ASC'],
        ['name', 'ASC'],
        [{ model: Category, as: 'subcategories' }, 'displayOrder', 'ASC'],
        [{ model: Category, as: 'subcategories' }, 'name', 'ASC'],
        [{ model: Category, as: 'subcategories' }, { model: Category, as: 'subcategories' }, 'displayOrder', 'ASC'],
        [{ model: Category, as: 'subcategories' }, { model: Category, as: 'subcategories' }, 'name', 'ASC']
      ]
    });

    res.json({ categoryTree: rootCategories });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateCategoryFilters = async (req, res) => {
  try {
    const { id } = req.params;
    const { filters } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    if (!filters) {
      return res.status(400).json({ message: 'Filters are required' });
    }

    await category.update({
      filters
    });

    res.json({
      message: 'Category filters updated successfully',
      filters: category.filters
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to check if a category is a descendant of another
async function isDescendantOf(categoryId, potentialAncestorId) {
  const category = await Category.findByPk(categoryId);

  if (!category) {
    return false;
  }

  if (!category.parentId) {
    return false;
  }

  if (category.parentId === parseInt(potentialAncestorId)) {
    return true;
  }

  return await isDescendantOf(category.parentId, potentialAncestorId);
}
