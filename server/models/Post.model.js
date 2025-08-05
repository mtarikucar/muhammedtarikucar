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
  // Images are now stored in post_images table
  categoryId: {
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue: null
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
  // View history is now tracked in analytics table
  readingTime: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  // SEO fields are stored in seo JSONB for now
  seo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  // Images are stored in images JSONB for now
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  // View history stored in JSONB
  viewHistory: {
    type: DataTypes.JSONB,
    defaultValue: []
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
    { fields: ['categoryId', 'status'] },
    { fields: ['tags'], using: 'gin' },
    { fields: ['publishedAt'] },
    { fields: ['views'] },
    { fields: ['featured', 'status'] }
  ]
});

// Hooks

Post.beforeSave(async (post, options) => {
  // Validate required fields (except when updating categoryId to null - category deletion)
  if (post.isNewRecord) {
    if (!post.title || !post.content || !post.excerpt || !post.categoryId || !post.authorId) {
      throw new Error('Missing required fields: title, content, excerpt, categoryId, and authorId are required');
    }
  } else {
    // For updates, only validate non-null fields (allow categoryId to be null for category deletion)
    if (post.title !== null && !post.title) {
      throw new Error('Title is required');
    }
    if (post.content !== null && !post.content) {
      throw new Error('Content is required');
    }
    if (post.excerpt !== null && !post.excerpt) {
      throw new Error('Excerpt is required');
    }
    if (post.authorId !== null && !post.authorId) {
      throw new Error('Author ID is required');
    }
  }

  // Calculate reading time
  if (post.changed('content')) {
    const wordCount = post.content.split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount === 0) {
      throw new Error('Content cannot be empty');
    }
    post.readingTime = Math.ceil(wordCount / 200);
  }

  // Set publishedAt for published posts
  if (post.status === 'published' && !post.publishedAt) {
    post.publishedAt = new Date();
  }
  
  // Validate status
  const validStatuses = ['draft', 'published', 'scheduled'];
  if (!validStatuses.includes(post.status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
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
  return `/blog/${this.id}`;
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
