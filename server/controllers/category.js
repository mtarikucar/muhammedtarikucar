const Category = require('../models/Category.model');
const Post = require('../models/Post.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

// Get all categories
async function getCategories(req, res, next) {
  try {
    const { 
      active,
      search,
      sort = 'name',
      page = 1,
      limit = 50
    } = req.query;

    const { Op } = require('sequelize');
    const whereClause = {};
    
    // Active filter
    if (active === 'true') {
      whereClause.isActive = true;
    } else if (active === 'false') {
      whereClause.isActive = false;
    }

    // Search filter
    if (search && search.trim()) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search.trim()}%` } },
        { description: { [Op.iLike]: `%${search.trim()}%` } }
      ];
    }

    let orderClause = [];
    switch (sort) {
      case 'name':
        orderClause = [['name', 'ASC']];
        break;
      case 'postCount':
        orderClause = [['postCount', 'DESC']];
        break;
      case 'createdAt':
      case 'newest':
        orderClause = [['createdAt', 'DESC']];
        break;
      case 'oldest':
        orderClause = [['createdAt', 'ASC']];
        break;
      default:
        orderClause = [['sortOrder', 'ASC'], ['name', 'ASC']];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      order: orderClause,
      offset: offset,
      limit: parseInt(limit),
      include: [
        { 
          model: require('../models').User, 
          as: 'createdBy', 
          attributes: ['id', 'name', 'email'],
          required: false
        }
      ]
    });

    // Calculate post counts for each category
    for (let category of categories) {
      const postCount = await Post.count({ 
        where: { 
          categoryId: category.id,
          status: 'published' 
        } 
      });
      category.dataValues.postCount = postCount;
    }

    const total = count;

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

// Get category by ID
async function getCategoryById(req, res, next) {
  try {
    const { id } = req.params;
    
    const category = await Category.findByPk(id, {
      include: [
        { model: require('../models').User, as: 'createdBy', attributes: ['id', 'name', 'email'] },
        { model: require('../models').User, as: 'updatedBy', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!category) {
      return next(AppError.notFound('Category not found'));
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
      return next(AppError.validation('Category name is required'));
    }

    // Check if category with same name exists
    const { Op } = require('sequelize');
    const existingCategory = await Category.findOne({
      where: {
        name: {
          [Op.iLike]: name.trim()
        }
      }
    });

    if (existingCategory) {
      return next(AppError.duplicateEntry('Category with this name already exists'));
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || '',
      color: color || '#3B82F6',
      icon: icon || 'folder',
      image,
      sortOrder: sortOrder || 0,
      seo: seo || {},
      createdById: req.user.id
    });

    // Category is already saved with create()

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

    const category = await Category.findByPk(id);

    if (!category) {
      return next(AppError.notFound('Category not found'));
    }

    // Check if new name conflicts with existing category
    if (name && name !== category.name) {
      const { Op } = require('sequelize');
      const existingCategory = await Category.findOne({
        where: {
          name: {
            [Op.iLike]: name.trim()
          },
          id: {
            [Op.ne]: category.id
          }
        }
      });

      if (existingCategory) {
        return next(AppError.duplicateEntry('Category with this name already exists'));
      }
    }

    // Prepare update data
    const updateData = {};
    if (name) {
      updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description.trim();
    if (color) updateData.color = color;
    if (icon) updateData.icon = icon;
    if (image !== undefined) updateData.image = image;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (seo) updateData.seo = { ...category.seo, ...seo };
    updateData.updatedById = req.user.id;

    await category.update(updateData);

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

    const category = await Category.findByPk(id);

    if (!category) {
      return next(AppError.notFound('Category not found'));
    }

    // Check if category has posts
    const postCount = await Post.count({ where: { categoryId: category.id } });

    if (postCount > 0) {
      // Move posts to null category (uncategorized)
      await Post.update(
        { categoryId: null },
        { where: { categoryId: category.id } }
      );
    }

    await category.destroy();

    logger.info(`Category deleted: ${category.name} by ${req.user.name}`);

    res.json({
      status: 'success',
      message: 'Category deleted successfully',
      data: {
        deletedCategory: category.name,
        affectedPosts: postCount
      }
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    next(error);
  }
}

// Get category statistics
async function getCategoryStats(req, res, next) {
  try {
    const { sequelize } = require('../config/database');
    
    // Get basic stats
    const totalCategories = await Category.count();
    const activeCategories = await Category.count({ where: { isActive: true } });
    
    // Get sum of post counts
    const totalPostsResult = await sequelize.query(
      'SELECT COALESCE(SUM("postCount"), 0) as total FROM categories',
      { type: sequelize.QueryTypes.SELECT }
    );
    const totalPosts = parseInt(totalPostsResult[0].total) || 0;

    // Get top categories
    const topCategories = await Category.findAll({
      where: { isActive: true },
      order: [['postCount', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'postCount', 'color']
    });

    res.json({
      status: 'success',
      data: {
        stats: { 
          totalCategories, 
          activeCategories, 
          totalPosts 
        },
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
      return next(AppError.validation('Categories array is required'));
    }

    // Use Sequelize transaction for bulk updates
    const { sequelize } = require('../config/database');
    
    await sequelize.transaction(async (t) => {
      for (const cat of categories) {
        await Category.update(
          { 
            sortOrder: cat.sortOrder, 
            updatedById: req.user.id 
          },
          { 
            where: { id: cat.id },
            transaction: t 
          }
        );
      }
    });

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
