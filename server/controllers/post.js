const Post = require("../models/Post.model");
const User = require("../models/User.model");
const Category = require("../models/Category.model");
const { VisitorSession } = require("../models/Analytics.model");
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

// Helper function to get admin user IDs
async function getAdminUserIds() {
  try {
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id']
    });
    return adminUsers.map(user => user.id);
  } catch (error) {
    logger.error('Error fetching admin user IDs:', error);
    return [];
  }
}

// Create a new blog post
async function createPost(req, res, next) {
  try {
    const {
      title,
      content,
      excerpt,
      category,
      tags,
      featuredImage,
      images,
      status,
      featured,
      seo
    } = req.body;

    // Validate required fields
    if (!title || !content || !excerpt || !category) {
      return next(AppError.validation('Title, content, excerpt, and category are required'));
    }

    // Create new post
    const post = await Post.create({
      title,
      content,
      excerpt,
      categoryId: category,
      tags: tags || [],
      featuredImage,
      images: images || [],
      authorId: req.user.id,
      status: status || 'draft',
      featured: featured || false,
      seo: seo || {}
    });

    // Get post with author and category information
    const postWithAuthor = await Post.findByPk(post.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'email', 'image']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    logger.info(`New blog post created: ${post.title} by ${req.user.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Blog post created successfully',
      data: { post: postWithAuthor }
    });
  } catch (error) {
    logger.error('Create post error:', error);
    next(error);
  }
}

// Get all published posts with pagination and filtering
async function getPosts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      tag,
      search,
      featured,
      sort = 'publishedAt'
    } = req.query;

    // Build where clause
    const { Op } = require('sequelize');
    const whereClause = { status: 'published' };

    if (category) {
      whereClause.categoryId = category;
    }

    if (tag) {
      whereClause.tags = { [Op.contains]: [tag] };
    }

    if (featured === 'true') {
      whereClause.featured = true;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }

    // Sort options
    let orderClause = [];
    switch (sort) {
      case 'views':
        orderClause = [['views', 'DESC']];
        break;
      case 'likes':
        orderClause = [['likes', 'DESC']];
        break;
      case 'title':
        orderClause = [['title', 'ASC']];
        break;
      default:
        orderClause = [['publishedAt', 'DESC']];
    }

    // Execute query with pagination
    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'image', 'bio', 'role']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: orderClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: { exclude: ['content'] } // Exclude full content for list view
    });

    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    next(error);
  }
}

// Get single post by ID (for editing)
async function getPostById(req, res, next) {
  try {
    const { id } = req.params;

    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'image', 'bio']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user can access this post
    const isAuthor = post.author.id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only edit your own posts'));
    }

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    logger.error('Get post by ID error:', error);
    next(error);
  }
}

// Get single post by ID (public)
async function getPost(req, res, next) {
  try {
    const { id } = req.params;

    const post = await Post.findOne({
      where: {
        id,
        status: 'published'
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'image', 'bio']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }]
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Track view by incrementing views count
    await post.increment('views');

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    logger.error('Get post error:', error);
    next(error);
  }
}

// Update post (users can update their own posts, admins can update any)
async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the post first to check ownership
    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'image']
      }]
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user is the author or admin
    const isAuthor = post.author.id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only update your own posts'));
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.author;
    delete updateData.views;
    delete updateData.viewHistory;

    // Non-admin users can't change certain fields
    if (!isAdmin) {
      delete updateData.featured;
      delete updateData.status; // Only admin can change status
    }

    await post.update(updateData);

    // Get updated post with author info
    const updatedPost = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'email', 'image']
      }]
    });

    logger.info(`Post updated: ${updatedPost.title} by ${req.user.name || req.user.id}`);

    res.json({
      status: 'success',
      message: 'Post updated successfully',
      data: { post: updatedPost }
    });
  } catch (error) {
    logger.error('Update post error:', error);
    next(error);
  }
}

// Delete post (users can delete their own posts, admins can delete any)
async function deletePost(req, res, next) {
  try {
    const { id } = req.params;

    // Find the post first to check ownership
    const post = await Post.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email', 'image']
      }]
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user is the author or admin
    const isAuthor = post.author.id === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only delete your own posts'));
    }

    await post.destroy();

    logger.info(`Post deleted: ${post.title} by ${req.user.name || req.user.id}`);

    res.json({
      status: 'success',
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Delete post error:', error);
    next(error);
  }
}

// Add comment to post (authenticated users)
async function addComment(req, res, next) {
  try {
    const { id } = req.params;
    const { text, parentComment } = req.body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return next(AppError.validation('Comment text is required'));
    }

    const post = await Post.findOne({ 
      where: { id, status: 'published' }
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // For PostgreSQL, comments should be stored in a separate Comment model
    // This is a simplified version - you may want to create a Comment model
    const comments = post.comments || [];
    const newComment = {
      id: require('uuid').v4(),
      name: req.user.name || 'Anonymous',
      email: req.user.email || '',
      website: '',
      text: text.trim(),
      parentComment: parentComment || null,
      isApproved: true,
      userId: req.user.id,
      createdAt: new Date()
    };

    comments.push(newComment);
    await post.update({ comments });

    logger.info(`New comment added to post: ${post.title} by ${req.user.name || req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Comment added successfully.',
      data: { comment: newComment }
    });
  } catch (error) {
    logger.error('Add comment error:', error);
    next(error);
  }
}

// Approve/reject comment (admin only)
async function moderateComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;
    const { action } = req.body; // 'approve' or 'reject'

    const post = await Post.findByPk(postId);

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    const comments = post.comments || [];
    const commentIndex = comments.findIndex(c => c.id === commentId);

    if (commentIndex === -1) {
      return next(AppError.notFound('Comment not found'));
    }

    if (action === 'approve') {
      comments[commentIndex].isApproved = true;
      await post.update({ comments });

      logger.info(`Comment approved on post: ${post.title}`);

      res.json({
        status: 'success',
        message: 'Comment approved successfully'
      });
    } else if (action === 'reject') {
      comments.splice(commentIndex, 1);
      await post.update({ comments });

      logger.info(`Comment rejected and deleted from post: ${post.title}`);

      res.json({
        status: 'success',
        message: 'Comment rejected and deleted successfully'
      });
    } else {
      return next(AppError.validation('Action must be either "approve" or "reject"'));
    }
  } catch (error) {
    logger.error('Moderate comment error:', error);
    next(error);
  }
}

// Delete comment (admin only)
async function deleteComment(req, res, next) {
  try {
    const { postId, commentId } = req.params;

    const post = await Post.findByPk(postId);

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    const comments = post.comments || [];
    const filteredComments = comments.filter(c => c.id !== commentId);
    await post.update({ comments: filteredComments });

    logger.info(`Comment deleted from post: ${post.title}`);

    res.json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    next(error);
  }
}

// Like/unlike post
async function toggleLike(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const post = await Post.findOne({ 
      where: { id, status: 'published' }
    });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user already liked this post
    const user = await User.findByPk(userId, {
      attributes: ['id', 'likedPosts']
    });
    const likedPosts = user?.likedPosts || [];
    const hasLiked = likedPosts.includes(post.id);

    if (hasLiked) {
      // Unlike the post
      const newLikes = Math.max(0, post.likes - 1);
      await post.update({ likes: newLikes });
      const updatedLikedPosts = likedPosts.filter(id => id !== post.id);
      await user.update({ likedPosts: updatedLikedPosts });
    } else {
      // Like the post
      await post.increment('likes');
      const updatedLikedPosts = [...likedPosts, post.id];
      await user.update({ likedPosts: updatedLikedPosts });
    }

    // Get updated post for response
    await post.reload();

    res.json({
      status: 'success',
      message: hasLiked ? 'Post unliked successfully' : 'Post liked successfully',
      data: {
        likes: post.likes,
        isLiked: !hasLiked
      }
    });
  } catch (error) {
    logger.error('Toggle like error:', error);
    next(error);
  }
}

// Get featured posts (admin only)
async function getFeaturedPosts(req, res, next) {
  try {
    const { limit = 3 } = req.query;
    const { Op } = require('sequelize');

    const adminUserIds = await getAdminUserIds();
    const posts = await Post.findAll({
      where: {
        status: 'published',
        featured: true,
        authorId: { [Op.in]: adminUserIds }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'image', 'role']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    logger.error('Get featured posts error:', error);
    next(error);
  }
}

// Get popular posts (admin only)
async function getPopularPosts(req, res, next) {
  try {
    const { limit = 5 } = req.query;
    const { Op } = require('sequelize');

    const adminUserIds = await getAdminUserIds();
    const posts = await Post.findAll({
      where: {
        status: 'published',
        authorId: { [Op.in]: adminUserIds }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'image', 'role']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['views', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    logger.error('Get popular posts error:', error);
    next(error);
  }
}

// Get recent posts (admin only)
async function getRecentPosts(req, res, next) {
  try {
    const { limit = 5 } = req.query;
    const { Op } = require('sequelize');

    const adminUserIds = await getAdminUserIds();
    const posts = await Post.findAll({
      where: {
        status: 'published',
        authorId: { [Op.in]: adminUserIds }
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'image', 'role']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      status: 'success',
      data: { posts }
    });
  } catch (error) {
    logger.error('Get recent posts error:', error);
    next(error);
  }
}

// Get posts by category
async function getPostsByCategory(req, res, next) {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Find category by id
    const categoryData = await Category.findByPk(category);

    if (!categoryData) {
      return res.status(404).json({
        status: 'error',
        message: 'Category not found'
      });
    }

    const { count, rows: posts } = await Post.findAndCountAll({
      where: {
        categoryId: categoryData.id,
        status: 'published'
      },
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'image']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }],
      order: [['publishedAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      attributes: { exclude: ['content'] }
    });

    res.json({
      status: 'success',
      data: {
        posts,
        category: categoryData,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get posts by category error:', error);
    next(error);
  }
}

// Get user's own posts
async function getUserPosts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sort = 'createdAt'
    } = req.query;

    const { Op } = require('sequelize');

    // Build where clause for user's posts
    const whereClause = { authorId: req.user.id };

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } },
        { content: { [Op.iLike]: `%${search}%` } },
        { tags: { [Op.overlap]: [search] } }
      ];
    }

    // Sort options
    let orderClause = [];
    switch (sort) {
      case 'views':
        orderClause = [['views', 'DESC']];
        break;
      case 'likes':
        orderClause = [['likes', 'DESC']];
        break;
      case 'title':
        orderClause = [['title', 'ASC']];
        break;
      case 'publishedAt':
        orderClause = [['publishedAt', 'DESC']];
        break;
      default:
        orderClause = [['createdAt', 'DESC']];
    }

    // Execute query with pagination
    const { count, rows: posts } = await Post.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'author',
        attributes: ['name', 'image', 'bio', 'role']
      }, {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'color']
      }],
      order: orderClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalPosts: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get user posts error:', error);
    next(error);
  }
}

module.exports = {
  createPost,
  getPosts,
  getPostById,
  getPost,
  updatePost,
  deletePost,
  addComment,
  moderateComment,
  deleteComment,
  toggleLike,
  getFeaturedPosts,
  getPopularPosts,
  getRecentPosts,
  getPostsByCategory,
  getUserPosts
};
