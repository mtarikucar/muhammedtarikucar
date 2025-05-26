const express = require('express');
const router = express.Router();
const {
  subscribe,
  confirmSubscription,
  unsubscribe,
  getSubscribers,
  getSubscriberStats,
  createCampaign,
  getCampaigns,
  sendCampaign
} = require('../controllers/newsletter');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');

// Public routes
router.post('/subscribe', subscribe);
router.get('/confirm/:token', confirmSubscription);
router.post('/unsubscribe', unsubscribe);

// Admin routes
router.get('/subscribers', verifyTokenAndAdmin, getSubscribers);
router.get('/subscribers/stats', verifyTokenAndAdmin, getSubscriberStats);
router.post('/campaigns', verifyTokenAndAdmin, createCampaign);
router.get('/campaigns', verifyTokenAndAdmin, getCampaigns);
router.post('/campaigns/:id/send', verifyTokenAndAdmin, sendCampaign);

module.exports = router;
