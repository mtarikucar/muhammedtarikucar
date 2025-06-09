const express = require('express');
const router = express.Router();
const {
  createComment,
  getCommentsByPost,
  updateComment,
  deleteComment,
  toggleCommentLike,
  getUserComments
} = require('../controllers/comment');
const { verifyTokenAndAuth, verifyTokenAndAdmin, authenticate } = require('../middlewares/verifyToken');

// Public routes
router.get('/post/:postId', getCommentsByPost);

// Authenticated user routes
router.post('/', authenticate, createComment);
router.put('/:id', verifyTokenAndAuth, updateComment);
router.delete('/:id', verifyTokenAndAuth, deleteComment);
router.post('/:id/like', authenticate, toggleCommentLike);
router.get('/user/:userId', verifyTokenAndAuth, getUserComments);

module.exports = router;
