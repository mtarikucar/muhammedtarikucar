const Category = require('../models/Category.model');
const Post = require('../models/Post.model');
const { logger } = require('../utils/logger');

// Get all categories
async function getCategories(req, res, next) {
  try {
    const { 
      active = 'true', 
      sort = 'sortOrder',
      page = 1,
      limit = 50
    } = req.query;

    const query = {};
    if (active === 'true') {
      query.isActive = true;
    }

    const sortOptions = {};
    switch (sort) {
      case 'name':
        sortOptions.name = 1;
        break;
      case 'postCount':
        sortOptions.postCount = -1;
        break;
      case 'newest':
        sortOptions.createdAt = -1;
        break;
      default:
        sortOptions.sortOrder = 1;
        sortOptions.name = 1;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const categories = await Category.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    const total = await Category.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        categories,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    logger.error('Get categories error:', error);
    next(error);
  }
}

// Get category by ID or slug
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId
      category = await Category.findById(id)
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
    } else {
      // Slug
      category = await Category.findOne({ slug: id, isActive: true })
        .populate('createdBy', 'name email')
        .populate('updatedBy', 'name email');
    }

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    res.json({
      status: 'success',
      data: { category }
    });
  } catch (error) {
    logger.error('Get category by ID error:', error);
    next(error);
  }
}

// Create new category
async function createCategory(req, res, next) {
  try {
    const {
      name,
      description,
      color,
      icon,
      image,
      sortOrder,
      seo
    } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Category name is required'
      });
    }

    // Check if category with same name exists
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        status: 'error',
        message: 'Category with this name already exists'
      });
    }

    // Generate slug from name
    const slug = name.trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    const category = new Category({
      name: name.trim(),
      slug,
      description: description?.trim() || '',
      color: color || '#3B82F6',
      icon: icon || 'folder',
      image,
      sortOrder: sortOrder || 0,
      seo,
      createdBy: req.user.id
    });

    await category.save();

    logger.info(`New category created: ${name} by ${req.user.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Create category error:', error);
    next(error);
  }
}

// Update category
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      color,
      icon,
      image,
      isActive,
      sortOrder,
      seo
    } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({
          status: 'error',
          message: 'Category with this name already exists'
        });
      }
    }

    // Update fields
    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description.trim();
    if (color) category.color = color;
    if (icon) category.icon = icon;
    if (image !== undefined) category.image = image;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;
    if (seo) category.seo = { ...category.seo, ...seo };
    
    category.updatedBy = req.user.id;

    await category.save();

    logger.info(`Category updated: ${category.name} by ${req.user.name}`);

    res.json({
      status: 'success',
      message: 'Category updated successfully',
      data: { category }
    });
  } catch (error) {
    logger.error('Update category error:', error);
    next(error);
  }
}

// Delete category
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    // Check if category has posts
    const postCount = await Post.countDocuments({ category: id });

    if (postCount > 0) {
      return res.status(400).json({
        status: 'error',
        message: `Cannot delete category. It has ${postCount} posts. Please move or delete the posts first.`
      });
    }

    await Category.findByIdAndDelete(id);

    logger.info(`Category deleted: ${category.name} by ${req.user.name}`);

    res.json({
      status: 'success',
      message: 'Category deleted successfully'
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    next(error);
  }
}

// Get category statistics
async function getCategoryStats(req, res, next) {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          totalPosts: { $sum: '$postCount' }
        }
      }
    ]);

    const topCategories = await Category.find({ isActive: true })
      .sort({ postCount: -1 })
      .limit(5)
      .select('name postCount color');

    res.json({
      status: 'success',
      data: {
        stats: stats[0] || { totalCategories: 0, activeCategories: 0, totalPosts: 0 },
        topCategories
      }
    });
  } catch (error) {
    logger.error('Get category stats error:', error);
    next(error);
  }
}

// Reorder categories
async function reorderCategories(req, res, next) {
  try {
    const { categories } = req.body; // Array of { id, sortOrder }

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        status: 'error',
        message: 'Categories array is required'
      });
    }

    const bulkOps = categories.map(cat => ({
      updateOne: {
        filter: { _id: cat.id },
        update: { sortOrder: cat.sortOrder, updatedBy: req.user.id }
      }
    }));

    await Category.bulkWrite(bulkOps);

    logger.info(`Categories reordered by ${req.user.name}`);

    res.json({
      status: 'success',
      message: 'Categories reordered successfully'
    });
  } catch (error) {
    logger.error('Reorder categories error:', error);
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  reorderCategories
};
