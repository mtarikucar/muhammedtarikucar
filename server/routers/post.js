const {
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
} = require("../controllers/post");
const { verifyTokenAndAuth, verifyTokenAndAdmin, authenticate } = require("../middlewares/verifyToken");
const router = require("express").Router();

// Public routes
router.get("/", getPosts);
router.get("/featured", getFeaturedPosts);
router.get("/popular", getPopularPosts);
router.get("/recent", getRecentPosts);
router.get("/category/:category", getPostsByCategory);

// Get user's own posts (must be before /:slug route)
router.get("/my-posts", authenticate, getUserPosts);

// Single post route (must be after specific routes)
router.get("/:slug", getPostBySlug);

// Comment routes (authenticated users can add comments)
router.post('/:slug/comments', authenticate, addComment);
router.post('/:slug/like', authenticate, toggleLike);

// User routes (authenticated users can create posts)
router.post("/", verifyTokenAndAuth, createPost);

// Post management routes (users can edit their own posts, admins can edit any)
router.put("/:id", verifyTokenAndAuth, updatePost);
router.delete("/:id", verifyTokenAndAuth, deletePost);

// Admin-only routes
router.patch("/comments/:postId/:commentId", verifyTokenAndAdmin, moderateComment);
router.delete("/comments/:postId/:commentId", verifyTokenAndAdmin, deleteComment);

module.exports = router;