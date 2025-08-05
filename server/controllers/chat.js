const { ChatRoom, ChatMessage, UserOnlineStatus } = require('../models/Chat.model');
const User = require('../models/User.model');
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

// Get all public chat rooms
const getPublicRooms = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    const { count, rows: rooms } = await ChatRoom.findAndCountAll({
      where: { 
        type: 'public', 
        isActive: true 
      },
      include: [{
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'image']
      }],
      order: [
        ['currentUsers', 'DESC'],
        ['createdAt', 'DESC']
      ],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      status: 'success',
      data: {
        rooms,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalRooms: count,
          hasNext: page < Math.ceil(count / limit),
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
    
    const rooms = await ChatRoom.findAll({
      where: {
        [Op.or]: [
          { createdById: userId },
          { moderators: { [Op.contains]: [userId] } },
          { type: 'public', isActive: true }
        ]
      },
      include: [{
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'image']
      }],
      order: [
        ['currentUsers', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

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
      return next(AppError.validation('Room name is required'));
    }

    const room = await ChatRoom.create({
      name: name.trim(),
      description: description?.trim() || '',
      type,
      maxUsers,
      createdById: req.user.id,
      currentUsers: 1
    });

    // Reload with associations
    await room.reload({
      include: [{
        model: User,
        as: 'createdBy',
        attributes: ['id', 'name', 'image']
      }]
    });

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
    const offset = (page - 1) * limit;

    // Check if room exists
    const room = await ChatRoom.findByPk(roomId);
    if (!room) {
      return next(AppError.notFound('Room not found'));
    }

    const { count, rows: messages } = await ChatMessage.findAndCountAll({
      where: { 
        roomId,
        isDeleted: false 
      },
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'image']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      status: 'success',
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalMessages: count,
          hasNext: page < Math.ceil(count / limit),
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    logger.error('Get room messages error:', error);
    next(error);
  }
};

// Send message
const sendMessage = async (req, res, next) => {
  try {
    const { roomId, content, type = 'text' } = req.body;

    if (!content || content.trim().length === 0) {
      return next(AppError.validation('Message content is required'));
    }

    // Check if room exists
    const room = await ChatRoom.findByPk(roomId);
    if (!room) {
      return next(AppError.notFound('Room not found'));
    }

    const message = await ChatMessage.create({
      roomId,
      senderId: req.user.id,
      content: content.trim(),
      type,
      isRead: false
    });

    // Reload with associations
    await message.reload({
      include: [{
        model: User,
        as: 'sender',
        attributes: ['id', 'name', 'image']
      }]
    });

    // This will be handled by socket.io for real-time delivery
    res.status(201).json({
      status: 'success',
      data: { message }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

// Join room (for tracking purposes)
const joinRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findByPk(roomId);
    if (!room) {
      return next(AppError.notFound('Room not found'));
    }

    // Update current users count
    await room.increment('currentUsers');

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

// Leave room (for tracking purposes)
const leaveRoom = async (req, res, next) => {
  try {
    const { roomId } = req.params;

    const room = await ChatRoom.findByPk(roomId);
    if (!room) {
      return next(AppError.notFound('Room not found'));
    }

    // Update current users count
    if (room.currentUsers > 0) {
      await room.decrement('currentUsers');
    }

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
    const onlineUsers = await UserOnlineStatus.findAll({
      where: { 
        isOnline: true,
        lastSeen: {
          [Op.gte]: new Date(Date.now() - 5 * 60 * 1000) // Active in last 5 minutes
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'image']
      }]
    });

    res.json({
      status: 'success',
      data: { 
        users: onlineUsers.map(status => ({
          ...status.user.toJSON(),
          lastSeen: status.lastSeen,
          socketId: status.socketId
        }))
      }
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