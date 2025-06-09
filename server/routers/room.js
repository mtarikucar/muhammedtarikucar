const express = require('express');
const router = express.Router();
const { createRoom, addMember, getRooms, startDirectMessage } = require('../controllers/room');
const { verifyTokenAndAuth, authenticate } = require("../middlewares/verifyToken");

// Authenticated user routes
router.post('/create', authenticate, createRoom);
router.post('/addMember', verifyTokenAndAuth, addMember);
router.get('/:userId', verifyTokenAndAuth, getRooms);
router.post('/createDirectMessage', authenticate, startDirectMessage);

module.exports = router;