const { ChatRoom, ChatMessage, UserOnlineStatus } = require('../models/Chat.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

// Get all public chat rooms
const getPublicRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const rooms = await ChatRoom.find({ type: 'public', isActive: true })
      .populate('createdBy', 'name image')
      .sort({ currentUsers: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ChatRoom.countDocuments({ type: 'public', isActive: true });

    res.json({
      status: 'success',
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRooms: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get public rooms error:', error);
    next(error);
  }
};

// Get user's rooms
const getUserRooms = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const rooms = await ChatRoom.find({
      $or: [
        { createdBy: userId },
        { moderators: userId },
        { type: 'public', isActive: true }
      ]
    })
    .populate('createdBy', 'name image')
    .sort({ currentUsers: -1, createdAt: -1 });

    res.json({
      status: 'success',
      data: { rooms }
    });
  } catch (error) {
    logger.error('Get user rooms error:', error);
    next(error);
  }
};

// Create a new chat room
const createRoom = async (req, res, next) => {
  try {
    const { name, description, type = 'public', maxUsers = 100 } = req.body;

    if (!name || name.trim().length === 0) {
      return next(new AppError('Room name is required', 'VALIDATION_ERROR', 400));
    }

    const room = new ChatRoom({
      name: name.trim(),
      description: description?.trim() || '',
      type,
      maxUsers,
      createdBy: req.user.id,
      currentUsers: 1
    });

    await room.save();
    await room.populate('createdBy', 'name image');

    logger.info(`Chat room created: ${room.name} by ${req.user.name || req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Room created successfully',
      data: { room }
    });
  } catch (error) {
    logger.error('Create room error:', error);
    next(error);
  }
};

// Get room messages
const getRoomMessages = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 'NOT_FOUND', 404));
    }

    if (room.type === 'private' && !room.isModerator(req.user.id)) {
      return next(new AppError('Access denied to private room', 'FORBIDDEN', 403));
    }

    const messages = await ChatMessage.getRoomMessages(roomId, page, limit);

    res.json({
      status: 'success',
      data: { messages }
    });
  } catch (error) {
    logger.error('Get room messages error:', error);
    next(error);
  }
};

// Send a message
const sendMessage = async (req, res, next) => {
  try {
    const { roomId, content, type = 'text', replyTo } = req.body;

    if (!roomId || !content || content.trim().length === 0) {
      return next(new AppError('Room ID and message content are required', 'VALIDATION_ERROR', 400));
    }

    // Check if room exists and user has access
    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 'NOT_FOUND', 404));
    }

    if (!room.isActive) {
      return next(new AppError('Room is not active', 'FORBIDDEN', 403));
    }

    if (room.isBanned(req.user.id)) {
      return next(new AppError('You are banned from this room', 'FORBIDDEN', 403));
    }

    const message = new ChatMessage({
      room: roomId,
      sender: req.user.id,
      content: content.trim(),
      type,
      replyTo: replyTo || null
    });

    await message.save();
    await message.populate('sender', 'name image');
    
    if (replyTo) {
      await message.populate('replyTo', 'content sender');
    }

    logger.info(`Message sent in room ${roomId} by ${req.user.name || req.user.id}`);

    res.status(201).json({
      status: 'success',
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

// Join a room
const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 'NOT_FOUND', 404));
    }

    if (!room.isActive) {
      return next(new AppError('Room is not active', 'FORBIDDEN', 403));
    }

    if (room.isBanned(req.user.id)) {
      return next(new AppError('You are banned from this room', 'FORBIDDEN', 403));
    }

    if (room.currentUsers >= room.maxUsers) {
      return next(new AppError('Room is full', 'FORBIDDEN', 403));
    }

    await room.addUser();

    res.json({
      status: 'success',
      message: 'Joined room successfully',
      data: { room }
    });
  } catch (error) {
    logger.error('Join room error:', error);
    next(error);
  }
};

// Leave a room
const leaveRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findById(roomId);
    if (!room) {
      return next(new AppError('Room not found', 'NOT_FOUND', 404));
    }

    await room.removeUser();

    res.json({
      status: 'success',
      message: 'Left room successfully'
    });
  } catch (error) {
    logger.error('Leave room error:', error);
    next(error);
  }
};

// Get online users
const getOnlineUsers = async (req, res, next) => {
  try {
    const { roomId } = req.query;

    const onlineUsers = await UserOnlineStatus.getOnlineUsers(roomId);

    res.json({
      status: 'success',
      data: { users: onlineUsers }
    });
  } catch (error) {
    logger.error('Get online users error:', error);
    next(error);
  }
};

module.exports = {
  getPublicRooms,
  getUserRooms,
  createRoom,
  getRoomMessages,
  sendMessage,
  joinRoom,
  leaveRoom,
  getOnlineUsers
};
