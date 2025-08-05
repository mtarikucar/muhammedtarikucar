const { ChatRoom, ChatMessage, UserOnlineStatus } = require('../models/Chat.model');
const { verifyToken } = require('./auth');
const { logger } = require('./logger');
const config = require('../config');

// Store active connections
const activeConnections = new Map();
const roomConnections = new Map();

const socketHandler = (io) => {
  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token, config.jwt.secret);
      socket.userId = decoded.id;
      socket.user = decoded;
      
      logger.info(`User ${decoded.id} connected via socket`);
      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    
    // Store connection
    activeConnections.set(userId, socket);

    // Update user online status
    updateUserOnlineStatus(userId, true, socket.id);

    // Handle joining a room
    socket.on('join_room', async (data) => {
      try {
        const { roomId } = data;
        
        // Verify room exists and user has access
        const room = await ChatRoom.findByPk(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.type === 'private' && !room.moderators?.includes(userId) && room.createdById !== userId) {
          socket.emit('error', { message: 'Access denied to private room' });
          return;
        }

        if (room.bannedUsers?.some(ban => ban.userId === userId)) {
          socket.emit('error', { message: 'You are banned from this room' });
          return;
        }

        // Join socket room
        socket.join(roomId);
        
        // Track room connection
        if (!roomConnections.has(roomId)) {
          roomConnections.set(roomId, new Set());
        }
        roomConnections.get(roomId).add(userId);

        // Update room user count
        await room.increment('currentUsers', { by: 1 });

        // Notify room about new user
        socket.to(roomId).emit('user_joined', {
          userId,
          user: socket.user,
          timestamp: new Date()
        });

        // Send confirmation to user
        socket.emit('room_joined', {
          roomId,
          room: room.toJSON(),
          timestamp: new Date()
        });

        logger.info(`User ${userId} joined room ${roomId}`);
      } catch (error) {
        logger.error('Join room error:', error);
        socket.emit('error', { message: 'Failed to join room' });
      }
    });

    // Handle leaving a room
    socket.on('leave_room', async (data) => {
      try {
        const { roomId } = data;
        
        // Leave socket room
        socket.leave(roomId);
        
        // Remove from room connections
        if (roomConnections.has(roomId)) {
          roomConnections.get(roomId).delete(userId);
          if (roomConnections.get(roomId).size === 0) {
            roomConnections.delete(roomId);
          }
        }

        // Update room user count
        const room = await ChatRoom.findByPk(roomId);
        if (room) {
          await room.increment('currentUsers', { by: -1 });
        }

        // Notify room about user leaving
        socket.to(roomId).emit('user_left', {
          userId,
          user: socket.user,
          timestamp: new Date()
        });

        // Send confirmation to user
        socket.emit('room_left', {
          roomId,
          timestamp: new Date()
        });

        logger.info(`User ${userId} left room ${roomId}`);
      } catch (error) {
        logger.error('Leave room error:', error);
        socket.emit('error', { message: 'Failed to leave room' });
      }
    });

    // Handle sending a message
    socket.on('send_message', async (data) => {
      try {
        const { roomId, content, type = 'text', replyTo, attachments } = data;

        if (!roomId || !content || content.trim().length === 0) {
          socket.emit('error', { message: 'Room ID and message content are required' });
          return;
        }

        // Verify room access
        const room = await ChatRoom.findByPk(roomId);
        if (!room) {
          socket.emit('error', { message: 'Room not found' });
          return;
        }

        if (room.bannedUsers?.some(ban => ban.userId === userId)) {
          socket.emit('error', { message: 'You are banned from this room' });
          return;
        }

        // Create message
        const message = await ChatMessage.create({
          roomId: roomId,
          senderId: userId,
          content: content.trim(),
          type,
          replyToId: replyTo || null,
          attachments: attachments || []
        });

        // Fetch message with associations
        const { User } = require('../models');
        const messageWithUser = await ChatMessage.findByPk(message.id, {
          include: [
            {
              model: User,
              as: 'sender',
              attributes: ['id', 'name', 'image']
            },
            {
              model: ChatMessage,
              as: 'replyTo',
              attributes: ['id', 'content', 'senderId'],
              required: false
            }
          ]
        });

        // Broadcast message to room
        io.to(roomId).emit('new_message', {
          message: messageWithUser.toJSON(),
          timestamp: new Date()
        });

        logger.info(`Message sent in room ${roomId} by user ${userId}`);
      } catch (error) {
        logger.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;

        const message = await ChatMessage.findByPk(messageId);
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Add reaction to message
        const reactions = message.reactions || [];
        const existingReaction = reactions.find(r => r.emoji === emoji);
        
        if (existingReaction) {
          if (!existingReaction.users.includes(userId)) {
            existingReaction.users.push(userId);
            existingReaction.count += 1;
          }
        } else {
          reactions.push({ emoji, users: [userId], count: 1 });
        }
        
        await message.update({ reactions });

        // Broadcast reaction to room
        io.to(message.roomId).emit('reaction_added', {
          messageId,
          userId,
          emoji,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_typing', {
        userId,
        user: socket.user,
        timestamp: new Date()
      });
    });

    socket.on('typing_stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('user_stopped_typing', {
        userId,
        user: socket.user,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      try {
        // Remove from active connections
        activeConnections.delete(userId);

        // Update user online status
        await updateUserOnlineStatus(userId, false);

        // Remove from all room connections
        for (const [roomId, users] of roomConnections.entries()) {
          if (users.has(userId)) {
            users.delete(userId);
            
            // Update room user count
            const room = await ChatRoom.findByPk(roomId);
            if (room) {
              await room.increment('currentUsers', { by: -1 });
            }

            // Notify room about user leaving
            socket.to(roomId).emit('user_left', {
              userId,
              user: socket.user,
              timestamp: new Date()
            });

            if (users.size === 0) {
              roomConnections.delete(roomId);
            }
          }
        }

        logger.info(`User ${userId} disconnected`);
      } catch (error) {
        logger.error('Disconnect error:', error);
      }
    });
  });
};

// Helper function to update user online status
const updateUserOnlineStatus = async (userId, isOnline, socketId = null) => {
  try {
    const [status, created] = await UserOnlineStatus.upsert({
      userId,
      isOnline,
      lastSeen: new Date(),
      socketId: isOnline ? socketId : null
    });
  } catch (error) {
    logger.error('Update online status error:', error);
  }
};

module.exports = socketHandler;
