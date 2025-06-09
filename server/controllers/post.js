const mongoose = require("mongoose");
const Post = require("../models/Post.model");
const { VisitorSession } = require("../models/Analytics.model");
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

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
    const post = new Post({
      title,
      content,
      excerpt,
      category,
      tags: tags || [],
      featuredImage,
      images: images || [],
      author: req.user.id,
      status: status || 'draft',
      featured: featured || false,
      seo: seo || {},
    });

    await post.save();

    // Populate author information
    await post.populate('author', 'name email image');

    logger.info(`New blog post created: ${post.title} by ${req.user.name}`);

    res.status(201).json({
      status: 'success',
      message: 'Blog post created successfully',
      data: { post }
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

    // Build query
    const query = { status: 'published' };

    if (category) {
      query.category = category;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    if (featured === 'true') {
      query.featured = true;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'likes':
        sortOption = { likes: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      default:
        sortOption = { publishedAt: -1 };
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'name image bio role')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-content'); // Exclude full content for list view

    // Filter posts to show only admin posts
    const adminPosts = posts.filter(post => post.author && post.author.role === 'admin');

    const total = await Post.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        posts: adminPosts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(adminPosts.length / limit),
          totalPosts: adminPosts.length,
          hasNext: page < Math.ceil(adminPosts.length / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get posts error:', error);
    next(error);
  }
}

// Get single post by slug
async function getPostBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const post = await Post.findOne({
      slug,
      status: 'published'
    })
    .populate('author', 'name image bio')
    .populate('relatedPosts', 'title slug excerpt featuredImage publishedAt readingTime');

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Track view
    const viewData = {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referrer'),
      country: req.get('CF-IPCountry') || 'Unknown',
      city: req.get('CF-IPCity') || 'Unknown',
    };

    await post.incrementViews(viewData);

    res.json({
      status: 'success',
      data: { post }
    });
  } catch (error) {
    logger.error('Get post by slug error:', error);
    next(error);
  }
}

// Update post (users can update their own posts, admins can update any)
async function updatePost(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the post first to check ownership
    const post = await Post.findById(id).populate('author', 'name email image');

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user is the author or admin
    const isAuthor = post.author._id.toString() === req.user.id;
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

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('author', 'name email image');

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
    const post = await Post.findById(id).populate('author', 'name email image');

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Check if user is the author or admin
    const isAuthor = post.author._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only delete your own posts'));
    }

    await Post.findByIdAndDelete(id);

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
    const { slug } = req.params;
    const { text, parentComment } = req.body;

    // Validate required fields
    if (!text || text.trim().length === 0) {
      return next(AppError.validation('Comment text is required'));
    }

    const post = await Post.findOne({ slug, status: 'published' });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Create new comment using authenticated user info
    const newComment = {
      name: req.user.name || 'Anonymous',
      email: req.user.email || '',
      website: '',
      text: text.trim(),
      parentComment: parentComment || null,
      isApproved: true, // Auto-approve comments from authenticated users
      userId: req.user.id // Add user reference
    };

    post.comments.push(newComment);
    await post.save();

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

    const post = await Post.findById(postId);

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return next(AppError.notFound('Comment not found'));
    }

    if (action === 'approve') {
      comment.isApproved = true;
      await post.save();

      logger.info(`Comment approved on post: ${post.title}`);

      res.json({
        status: 'success',
        message: 'Comment approved successfully'
      });
    } else if (action === 'reject') {
      post.comments.pull(commentId);
      await post.save();

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

    const post = await Post.findById(postId);

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    post.comments.pull(commentId);
    await post.save();

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
    const { slug } = req.params;

    const post = await Post.findOne({ slug, status: 'published' });

    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Simple increment/decrement for anonymous likes
    post.likes += 1;
    await post.save();

    res.json({
      status: 'success',
      message: 'Post liked successfully',
      data: { likes: post.likes }
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

    const posts = await Post.getFeaturedPosts(parseInt(limit));

    // Filter posts to show only admin posts
    const adminPosts = posts.filter(post => post.author && post.author.role === 'admin');

    res.json({
      status: 'success',
      data: { posts: adminPosts }
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

    const posts = await Post.getPopularPosts(parseInt(limit));

    // Filter posts to show only admin posts
    const adminPosts = posts.filter(post => post.author && post.author.role === 'admin');

    res.json({
      status: 'success',
      data: { posts: adminPosts }
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

    const posts = await Post.getRecentPosts(parseInt(limit));

    // Filter posts to show only admin posts
    const adminPosts = posts.filter(post => post.author && post.author.role === 'admin');

    res.json({
      status: 'success',
      data: { posts: adminPosts }
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

    const posts = await Post.find({
      category,
      status: 'published'
    })
    .populate('author', 'name image')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .select('-content');

    const total = await Post.countDocuments({ category, status: 'published' });

    res.json({
      status: 'success',
      data: {
        posts,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
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

    // Build query for user's posts
    const query = { author: req.user.id };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Sort options
    let sortOption = {};
    switch (sort) {
      case 'views':
        sortOption = { views: -1 };
        break;
      case 'likes':
        sortOption = { likes: -1 };
        break;
      case 'title':
        sortOption = { title: 1 };
        break;
      case 'publishedAt':
        sortOption = { publishedAt: -1 };
        break;
      default:
        sortOption = { createdAt: -1 };
    }

    // Execute query with pagination
    const posts = await Post.find(query)
      .populate('author', 'name image bio role')
      .populate('category', 'name slug color')
      .sort(sortOption)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Post.countDocuments(query);

    res.json({
      status: 'success',
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPosts: total,
          hasNext: page < Math.ceil(total / limit),
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
  getPostBySlug,
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
