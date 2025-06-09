const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Chat Room Schema
const chatRoomSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      maxlength: 500,
      default: ''
    },
    type: {
      type: String,
      enum: ['public', 'private', 'direct'],
      default: 'public'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    maxUsers: {
      type: Number,
      default: 100
    },
    currentUsers: {
      type: Number,
      default: 0
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    moderators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    bannedUsers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      bannedAt: {
        type: Date,
        default: Date.now
      },
      bannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String
    }],
    settings: {
      allowAnonymous: {
        type: Boolean,
        default: true
      },
      requireModeration: {
        type: Boolean,
        default: false
      },
      allowFileUpload: {
        type: Boolean,
        default: true
      },
      maxMessageLength: {
        type: Number,
        default: 1000
      }
    }
  },
  {
    timestamps: true
  }
);

// Chat Message Schema
const chatMessageSchema = new Schema(
  {
    room: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom',
      required: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [{
      filename: String,
      originalName: String,
      mimetype: String,
      size: Number,
      url: String
    }],
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: Date,
    isDeleted: {
      type: Boolean,
      default: false
    },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatMessage'
    },
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    readBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      readAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  {
    timestamps: true
  }
);

// User Online Status Schema
const userOnlineStatusSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    currentRoom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatRoom'
    },
    socketId: String,
    status: {
      type: String,
      enum: ['online', 'away', 'busy', 'offline'],
      default: 'offline'
    },
    statusMessage: {
      type: String,
      maxlength: 100,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Indexes
chatRoomSchema.index({ type: 1, isActive: 1 });
chatRoomSchema.index({ createdBy: 1 });
chatRoomSchema.index({ name: 'text', description: 'text' });

chatMessageSchema.index({ room: 1, createdAt: -1 });
chatMessageSchema.index({ sender: 1 });
chatMessageSchema.index({ isDeleted: 1 });

userOnlineStatusSchema.index({ user: 1 });
userOnlineStatusSchema.index({ isOnline: 1 });
userOnlineStatusSchema.index({ lastSeen: -1 });

// Static methods for ChatRoom
chatRoomSchema.statics.getPublicRooms = function() {
  return this.find({ type: 'public', isActive: true })
    .populate('createdBy', 'name image')
    .sort({ currentUsers: -1, createdAt: -1 });
};

chatRoomSchema.statics.getUserRooms = function(userId) {
  return this.find({
    $or: [
      { createdBy: userId },
      { moderators: userId },
      { type: 'public', isActive: true }
    ]
  })
  .populate('createdBy', 'name image')
  .sort({ currentUsers: -1, createdAt: -1 });
};

// Instance methods for ChatRoom
chatRoomSchema.methods.addUser = function() {
  this.currentUsers += 1;
  return this.save();
};

chatRoomSchema.methods.removeUser = function() {
  if (this.currentUsers > 0) {
    this.currentUsers -= 1;
  }
  return this.save();
};

chatRoomSchema.methods.isBanned = function(userId) {
  return this.bannedUsers.some(ban => ban.user.toString() === userId.toString());
};

chatRoomSchema.methods.isModerator = function(userId) {
  return this.moderators.includes(userId) || this.createdBy.toString() === userId.toString();
};

// Static methods for ChatMessage
chatMessageSchema.statics.getRoomMessages = function(roomId, page = 1, limit = 50) {
  const skip = (page - 1) * limit;
  
  return this.find({ room: roomId, isDeleted: false })
    .populate('sender', 'name avatar')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

chatMessageSchema.statics.getUnreadCount = function(roomId, userId, lastReadAt) {
  return this.countDocuments({
    room: roomId,
    sender: { $ne: userId },
    createdAt: { $gt: lastReadAt },
    isDeleted: false
  });
};

// Instance methods for ChatMessage
chatMessageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  
  // Add new reaction
  this.reactions.push({ user: userId, emoji });
  return this.save();
};

chatMessageSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(r => r.user.toString() !== userId.toString());
  return this.save();
};

chatMessageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => r.user.toString() === userId.toString());
  if (!existingRead) {
    this.readBy.push({ user: userId });
    return this.save();
  }
  return Promise.resolve(this);
};

// Static methods for UserOnlineStatus
userOnlineStatusSchema.statics.setUserOnline = function(userId, socketId, roomId = null) {
  return this.findOneAndUpdate(
    { user: userId },
    {
      isOnline: true,
      status: 'online',
      lastSeen: new Date(),
      socketId,
      currentRoom: roomId
    },
    { upsert: true, new: true }
  );
};

userOnlineStatusSchema.statics.setUserOffline = function(userId) {
  return this.findOneAndUpdate(
    { user: userId },
    {
      isOnline: false,
      status: 'offline',
      lastSeen: new Date(),
      socketId: null,
      currentRoom: null
    },
    { new: true }
  );
};

userOnlineStatusSchema.statics.getOnlineUsers = function(roomId = null) {
  const query = { isOnline: true };
  if (roomId) {
    query.currentRoom = roomId;
  }
  
  return this.find(query)
    .populate('user', 'name image')
    .sort({ lastSeen: -1 });
};

// Transform output
chatRoomSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

chatMessageSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

userOnlineStatusSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const ChatRoom = mongoose.model('ChatRoom', chatRoomSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
const UserOnlineStatus = mongoose.model('UserOnlineStatus', userOnlineStatusSchema);

module.exports = {
  ChatRoom,
  ChatMessage,
  UserOnlineStatus
};
