const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    set(value) {
      this.setDataValue('title', value.trim());
    }
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    set(value) {
      this.setDataValue('slug', value.toLowerCase());
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  excerpt: {
    type: DataTypes.STRING(300),
    allowNull: false
  },
  featuredImage: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  images: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  categoryId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'archived'),
    defaultValue: 'draft'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  viewHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  readingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  seo: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  relatedPosts: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'posts',
  timestamps: true,
  indexes: [
    { fields: ['slug'], unique: true },
    { fields: ['categoryId', 'status'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['publishedAt'] },
    { fields: ['views'] },
    { fields: ['featured', 'status'] }
  ]
});

// Hooks
Post.beforeSave(async (post, options) => {
  if (post.changed('title') && !post.slug) {
    post.slug = post.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  if (post.changed('content')) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = post.content.split(/\s+/).length;
    post.readingTime = Math.ceil(wordCount / 200);
  }

  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
});

// Instance methods
Post.prototype.incrementViews = async function(viewData) {
  this.views += 1;
  const currentHistory = this.viewHistory || [];
  currentHistory.push(viewData);
  this.viewHistory = currentHistory;
  return await this.save();
};

Post.prototype.getUrl = function() {
  return `/blog/${this.slug}`;
};

// Class methods
Post.getPopularPosts = async function(limit = 5) {
  return await this.findAll({
    where: { status: 'published' },
    include: [{
      model: require('./User.model'),
      as: 'author',
      attributes: ['name', 'image', 'role']
    }],
    order: [['views', 'DESC']],
    limit
  });
};

Post.getRecentPosts = async function(limit = 5) {
  return await this.findAll({
    where: { status: 'published' },
    include: [{
      model: require('./User.model'),
      as: 'author',
      attributes: ['name', 'image', 'role']
    }],
    order: [['publishedAt', 'DESC']],
    limit
  });
};

Post.getFeaturedPosts = async function(limit = 3) {
  return await this.findAll({
    where: {
      status: 'published',
      featured: true
    },
    include: [{
      model: require('./User.model'),
      as: 'author',
      attributes: ['name', 'image', 'role']
    }],
    order: [['publishedAt', 'DESC']],
    limit
  });
};

module.exports = Post;
