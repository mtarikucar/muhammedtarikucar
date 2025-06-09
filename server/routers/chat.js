const express = require('express');
const router = express.Router();
const {
  getPublicRooms,
  getUserRooms,
  createRoom,
  getRoomMessages,
  sendMessage,
  joinRoom,
  leaveRoom,
  getOnlineUsers
} = require('../controllers/chat');
const { authenticate } = require('../middlewares/verifyToken');

// Public routes
router.get('/rooms/public', getPublicRooms);

// Authenticated routes
router.use(authenticate);

// Room management
router.get('/rooms/my', getUserRooms);
router.post('/rooms', createRoom);
router.post('/rooms/:roomId/join', joinRoom);
router.post('/rooms/:roomId/leave', leaveRoom);

// Messages
router.get('/rooms/:roomId/messages', getRoomMessages);
router.post('/messages', sendMessage);

// Users
router.get('/users/online', getOnlineUsers);

module.exports = router;
