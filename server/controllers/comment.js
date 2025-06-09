/**
 * Comment controller
 * Handles comment operations for posts
 */
const Comment = require('../models/Comment.model');
const Post = require('../models/Post.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

/**
 * Create a new comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function createComment(req, res, next) {
  try {
    const { postId, content, parentComment } = req.body;

    // Validate required fields
    if (!postId || !content) {
      return next(AppError.validation('Post ID and content are required'));
    }

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    // Create new comment
    const comment = new Comment({
      userId: req.user.id,
      postId,
      content: content.trim(),
      parentComment: parentComment || null,
      isApproved: true // Auto-approve comments from authenticated users
    });

    await comment.save();

    // Populate user information
    await comment.populate('userId', 'name image');

    logger.info(`New comment created by user ${req.user.id} on post ${postId}`);

    res.status(201).json({
      status: 'success',
      message: 'Comment created successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Create comment error:', error);
    next(error);
  }
}

/**
 * Get comments for a post
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getCommentsByPost(req, res, next) {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return next(AppError.notFound('Post not found'));
    }

    const comments = await Comment.find({ 
      postId, 
      isApproved: true 
    })
    .populate('userId', 'name image')
    .populate('parentComment', 'content userId')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ postId, isApproved: true });

    res.json({
      status: 'success',
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get comments error:', error);
    next(error);
  }
}

/**
 * Update a comment (user can update their own comments)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function updateComment(req, res, next) {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return next(AppError.validation('Content is required'));
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(AppError.notFound('Comment not found'));
    }

    // Check if user is the author or admin
    const isAuthor = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only update your own comments'));
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate('userId', 'name image');

    logger.info(`Comment updated by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    logger.error('Update comment error:', error);
    next(error);
  }
}

/**
 * Delete a comment (user can delete their own comments)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function deleteComment(req, res, next) {
  try {
    const { id } = req.params;

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(AppError.notFound('Comment not found'));
    }

    // Check if user is the author or admin
    const isAuthor = comment.userId.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return next(AppError.forbidden('You can only delete your own comments'));
    }

    await Comment.findByIdAndDelete(id);

    logger.info(`Comment deleted by user ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    logger.error('Delete comment error:', error);
    next(error);
  }
}

/**
 * Like/unlike a comment
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function toggleCommentLike(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const comment = await Comment.findById(id);
    if (!comment) {
      return next(AppError.notFound('Comment not found'));
    }

    const hasLiked = comment.likedBy.includes(userId);

    if (hasLiked) {
      // Unlike
      comment.likedBy.pull(userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // Like
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      status: 'success',
      message: hasLiked ? 'Comment unliked' : 'Comment liked',
      data: { 
        likes: comment.likes,
        hasLiked: !hasLiked
      }
    });
  } catch (error) {
    logger.error('Toggle comment like error:', error);
    next(error);
  }
}

/**
 * Get user's comments
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
async function getUserComments(req, res, next) {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Check if user is requesting their own comments or is admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return next(AppError.forbidden('You can only view your own comments'));
    }

    const comments = await Comment.find({ userId })
      .populate('postId', 'title slug')
      .populate('parentComment', 'content')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ userId });

    res.json({
      status: 'success',
      data: {
        comments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalComments: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get user comments error:', error);
    next(error);
  }
}

module.exports = {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getUserComments
};
