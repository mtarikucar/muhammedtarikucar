const express = require('express');
const router = express.Router();
const {
  getDashboardAnalytics,
  getDetailedAnalytics,
  getRealtimeAnalytics,
  trackPageView,
  getPostAnalytics
} = require('../controllers/analytics');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');

// Public route for tracking
router.post('/track', trackPageView);

// Admin routes
router.get('/dashboard', verifyTokenAndAdmin, getDashboardAnalytics);
router.get('/detailed', verifyTokenAndAdmin, getDetailedAnalytics);
router.get('/realtime', verifyTokenAndAdmin, getRealtimeAnalytics);
router.get('/posts/:slug', verifyTokenAndAdmin, getPostAnalytics);

module.exports = router;
