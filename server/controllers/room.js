const Room = require("../models/Room.model");
const User = require("../models/User.model");
const Community = require("../models/Community.model");
const { AppError } = require('../middlewares/errorHandler');
const { logger } = require('../utils/logger');

const createRoom = async (req, res, next) => {
  try {
    const { name, image } = req.body;
    const adminId = req.user.id;

    if (!name || name.trim().length === 0) {
      return next(AppError.validation('Room name is required'));
    }

    const newRoom = await Room.create({ 
      name: name.trim(), 
      adminId, 
      image 
    });

    // Add admin as member
    await newRoom.addMember(adminId);
    
    // Reload with associations
    await newRoom.reload({
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'name', 'image']
      }, {
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'image']
      }]
    });

    logger.info(`Room created: ${newRoom.name} by ${req.user.name || req.user.id}`);

    res.status(201).json({
      status: 'success',
      data: { room: newRoom }
    });
  } catch (error) {
    logger.error('Create room error:', error);
    next(error);
  }
};

const addMember = async (req, res, next) => {
  try {
    const { roomId, memberId } = req.body;

    if (!roomId || !memberId) {
      return next(AppError.validation('Room ID and Member ID are required'));
    }

    const room = await Room.findByPk(roomId, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id']
      }]
    });
    
    if (!room) {
      return next(AppError.notFound('Room not found'));
    }

    // Check if user is admin or member of the room
    if (room.adminId !== req.user.id && !room.members.some(m => m.id === req.user.id)) {
      return next(AppError.forbidden('You are not authorized to add members to this room'));
    }

    // Check if member exists
    const member = await User.findByPk(memberId);
    if (!member) {
      return next(AppError.notFound('User not found'));
    }

    // Check if already a member
    if (room.members.some(m => m.id === memberId)) {
      return res.json({
        status: 'success',
        message: 'User is already a member of this room',
        data: { room }
      });
    }

    // Add member
    await room.addMember(memberId);
    
    // Reload with updated members
    await room.reload({
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'name', 'image']
      }, {
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'image']
      }]
    });

    logger.info(`Member ${memberId} added to room ${roomId} by ${req.user.id}`);

    res.json({
      status: 'success',
      message: 'Member added successfully',
      data: { room }
    });
  } catch (error) {
    logger.error('Add member error:', error);
    next(error);
  }
};

const startDirectMessage = async (req, res, next) => {
  try {
    const { userId1, userId2, name } = req.body;

    if (!userId1 || !userId2) {
      return next(AppError.validation('Both user IDs are required'));
    }

    // Verify both users exist
    const user1 = await User.findByPk(userId1);
    const user2 = await User.findByPk(userId2);

    if (!user1 || !user2) {
      return next(AppError.notFound('One or more users not found'));
    }

    // Create a new room for direct message
    const roomName = name || `${user1.name} & ${user2.name}`;
    const newRoom = await Room.create({ 
      name: roomName,
      adminId: userId1 // First user is admin by default
    });

    // Add both users as members
    await newRoom.addMembers([userId1, userId2]);
    
    // Reload with associations
    await newRoom.reload({
      include: [{
        model: User,
        as: 'admin',
        attributes: ['id', 'name', 'image']
      }, {
        model: User,
        as: 'members',
        attributes: ['id', 'name', 'image']
      }]
    });

    logger.info(`Direct message room created between ${userId1} and ${userId2}`);
    
    res.status(201).json({
      status: 'success',
      data: { room: newRoom }
    });
  } catch (error) {
    logger.error('Start direct message error:', error);
    next(error);
  }
};

const getRooms = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Verify requesting user has access
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return next(AppError.forbidden('You can only view your own rooms'));
    }

    const user = await User.findByPk(userId, {
      include: [{
        model: Room,
        as: 'rooms',
        include: [{
          model: User,
          as: 'admin',
          attributes: ['id', 'name', 'image']
        }, {
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'image']
        }, {
          model: Community,
          as: 'community',
          attributes: ['id', 'name']
        }]
      }, {
        model: Room,
        as: 'adminRooms',
        include: [{
          model: User,
          as: 'members',
          attributes: ['id', 'name', 'image']
        }]
      }]
    });

    if (!user) {
      return next(AppError.notFound('User not found'));
    }

    // Combine rooms where user is member and admin
    const allRooms = [
      ...user.rooms,
      ...user.adminRooms.filter(adminRoom => 
        !user.rooms.some(room => room.id === adminRoom.id)
      )
    ];

    res.json({
      status: 'success',
      data: { rooms: allRooms }
    });
  } catch (error) {
    logger.error('Get rooms error:', error);
    next(error);
  }
};

module.exports = { createRoom, getRooms, addMember, startDirectMessage };