const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community');
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")

router.post('/create', verifyTokenAndAuth, communityController.createCommunity);
router.post('/join/:communityId', verifyTokenAndAuth, communityController.sendJoinRequest);
router.patch('/join/:requestId', verifyTokenAndAuth, communityController.handleJoinRequest);

module.exports = router;