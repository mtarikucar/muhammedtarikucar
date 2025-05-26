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
  getPostsByCategory
} = require("../controllers/post");
const { verifyTokenAndAuth, verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const router = require("express").Router();

// Public routes
router.get("/", getPosts);
router.get("/featured", getFeaturedPosts);
router.get("/popular", getPopularPosts);
router.get("/recent", getRecentPosts);
router.get("/category/:category", getPostsByCategory);
router.get("/:slug", getPostBySlug);

// Comment routes (public for adding, admin for moderation)
router.post('/:slug/comments', addComment);
router.post('/:slug/like', toggleLike);

// Admin routes
router.post("/", verifyTokenAndAdmin, createPost);
router.put("/:id", verifyTokenAndAdmin, updatePost);
router.delete("/:id", verifyTokenAndAdmin, deletePost);
router.patch("/comments/:postId/:commentId", verifyTokenAndAdmin, moderateComment);
router.delete("/comments/:postId/:commentId", verifyTokenAndAdmin, deleteComment);

module.exports = router;