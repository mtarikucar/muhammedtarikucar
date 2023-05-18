const express = require('express');
const router = express.Router();
const communityController = require('../controllers/community');
const {verifyTokenAndAuth} = require("../middlewares/verifyToken")
const {updateUserById} = require('../controllers/user');
router.post('/create', verifyTokenAndAuth, communityController.createCommunity,updateUserById);
router.post('/join/:communityId', verifyTokenAndAuth, communityController.sendJoinRequest);
router.patch('/join/:requestId', verifyTokenAndAuth, communityController.handleJoinRequest);
router.get('/:id', verifyTokenAndAuth, communityController.getCommunityById);
router.put('/:id', verifyTokenAndAuth, communityController.updateCommunityById);
router.get('/join/:communityId', verifyTokenAndAuth, communityController.getJoinRequests);

module.exports = router;