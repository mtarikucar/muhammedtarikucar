const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Chat Room Model
const ChatRoom = sequelize.define('ChatRoom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    set(value) {
      this.setDataValue('name', value.trim());
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: true,
    defaultValue: ''
  },
  type: {
    type: DataTypes.ENUM('public', 'private', 'direct'),
    defaultValue: 'public'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 100
  },
  currentUsers: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  createdById: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  moderators: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    allowNull: true,
    defaultValue: []
  },
  bannedUsers: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  settings: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      allowAnonymous: true,
      requireModeration: false,
      allowFileUpload: true,
      maxMessageLength: 1000
    }
  }
}, {
  tableName: 'chat_rooms',
  timestamps: true,
  indexes: [
    { fields: ['type', 'isActive'] },
    { fields: ['createdById'] }
  ]
});

// Chat Message Model
const ChatMessage = sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'ChatRooms',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.STRING(1000),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('text', 'image', 'file', 'system'),
    defaultValue: 'text'
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  isEdited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  editedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  deletedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deletedById: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  replyToId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ChatMessages',
      key: 'id'
    }
  },
  reactions: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  readBy: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  }
}, {
  tableName: 'chat_messages',
  timestamps: true,
  indexes: [
    { fields: ['roomId', 'createdAt'] },
    { fields: ['senderId'] },
    { fields: ['isDeleted'] }
  ]
});

// User Online Status Model
const UserOnlineStatus = sequelize.define('UserOnlineStatus', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isOnline: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  lastSeen: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  currentRoomId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'ChatRooms',
      key: 'id'
    }
  },
  socketId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('online', 'away', 'busy', 'offline'),
    defaultValue: 'offline'
  },
  statusMessage: {
    type: DataTypes.STRING(100),
    allowNull: true,
    defaultValue: ''
  }
}, {
  tableName: 'user_online_status',
  timestamps: true,
  indexes: [
    { fields: ['userId'], unique: true },
    { fields: ['isOnline'] },
    { fields: ['lastSeen'] }
  ]
});

// Basic class methods for ChatRoom
ChatRoom.getPublicRooms = async function() {
  const User = require('./User.model');
  return await this.findAll({
    where: { type: 'public', isActive: true },
    include: [{
      model: User,
      as: 'createdBy',
      attributes: ['name', 'image']
    }],
    order: [['currentUsers', 'DESC'], ['createdAt', 'DESC']]
  });
};

// Basic instance methods for ChatRoom
ChatRoom.prototype.addUser = async function() {
  this.currentUsers += 1;
  return await this.save();
};

ChatRoom.prototype.removeUser = async function() {
  if (this.currentUsers > 0) {
    this.currentUsers -= 1;
  }
  return await this.save();
};

// Basic class methods for ChatMessage
ChatMessage.getRoomMessages = async function(roomId, page = 1, limit = 50) {
  const User = require('./User.model');
  const offset = (page - 1) * limit;

  return await this.findAll({
    where: { roomId, isDeleted: false },
    include: [{
      model: User,
      as: 'sender',
      attributes: ['name', 'image']
    }],
    order: [['createdAt', 'DESC']],
    offset,
    limit
  });
};

// Basic class methods for UserOnlineStatus
UserOnlineStatus.setUserOnline = async function(userId, socketId, roomId = null) {
  const [status] = await this.upsert({
    userId,
    isOnline: true,
    status: 'online',
    lastSeen: new Date(),
    socketId,
    currentRoomId: roomId
  });
  return status;
};

UserOnlineStatus.setUserOffline = async function(userId) {
  return await this.update({
    isOnline: false,
    status: 'offline',
    lastSeen: new Date(),
    socketId: null,
    currentRoomId: null
  }, {
    where: { userId }
  });
};

module.exports = {
  ChatRoom,
  ChatMessage,
  UserOnlineStatus
};
