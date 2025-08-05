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
router.get('/:id', getCategoryById); // UUID only

// Authenticated user routes (only admin can create categories)
router.post('/', verifyTokenAndAdmin, createCategory);

// Admin routes
router.put('/:id', verifyTokenAndAdmin, updateCategory); // UUID only
router.delete('/:id', verifyTokenAndAdmin, deleteCategory); // UUID only
router.post('/reorder', verifyTokenAndAdmin, reorderCategories);

module.exports = router;
