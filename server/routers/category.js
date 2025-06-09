const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoryStats,
  reorderCategories
} = require('../controllers/category');
const { verifyTokenAndAuth, verifyTokenAndAdmin } = require('../middlewares/verifyToken');

// Public routes
router.get('/', getCategories);
router.get('/stats', getCategoryStats);
router.get('/:id', getCategoryById);

// Authenticated user routes (users can create categories)
router.post('/', verifyTokenAndAuth, createCategory);

// Admin routes
router.put('/:id', verifyTokenAndAdmin, updateCategory);
router.delete('/:id', verifyTokenAndAdmin, deleteCategory);
router.post('/reorder', verifyTokenAndAdmin, reorderCategories);

module.exports = router;
