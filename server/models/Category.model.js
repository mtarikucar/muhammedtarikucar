const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Category = sequelize.define('Category', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('name', value.trim());
    }
  },
  description: {
    type: DataTypes.STRING(200),
    allowNull: true,
    defaultValue: ''
  },
  color: {
    type: DataTypes.STRING,
    defaultValue: '#3B82F6',
    validate: {
      is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    }
  },
  icon: {
    type: DataTypes.STRING(50),
    defaultValue: 'folder'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  postCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  seo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false
  },
  updatedById: {
    type: DataTypes.UUID,
    allowNull: true
  }
}, {
  tableName: 'categories',
  timestamps: true,
  indexes: [
    { fields: ['isActive'] },
    { fields: ['sortOrder'] }
  ]
});

// Hooks

Category.beforeSave(async (category, options) => {
  // Validate required fields
  if (!category.name) {
    throw new Error('Category name is required');
  }
  
  if (!category.createdById) {
    throw new Error('Creator ID is required');
  }
  
  // Validate color format
  if (category.color && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(category.color)) {
    throw new Error('Invalid color format. Must be hex color (e.g., #3B82F6)');
  }
});

// Class methods
Category.getActiveCategories = async function() {
  return await this.findAll({
    where: { isActive: true },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};


Category.updatePostCount = async function(categoryId) {
  const Post = require('./Post.model');
  const count = await Post.count({
    where: { categoryId, status: 'published' }
  });
  return await this.update(
    { postCount: count },
    { where: { id: categoryId }, returning: true }
  );
};

// Instance methods
Category.prototype.incrementPostCount = async function() {
  this.postCount += 1;
  return await this.save();
};

Category.prototype.decrementPostCount = async function() {
  if (this.postCount > 0) {
    this.postCount -= 1;
  }
  return await this.save();
};

Category.prototype.getUrl = function() {
  return `/blog/category/${this.id}`;
};

module.exports = Category;
