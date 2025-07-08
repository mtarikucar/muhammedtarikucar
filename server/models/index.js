const { sequelize } = require('../config/database');

// Import all models
const User = require('./User.model');
const Post = require('./Post.model');
const Category = require('./Category.model');
const Community = require('./Community.model');
const Room = require('./Room.model');
const Message = require('./Message.model');
const Event = require('./Event.model');

// Define associations

// User associations
User.hasMany(Post, { foreignKey: 'authorId', as: 'posts' });
User.hasMany(Category, { foreignKey: 'createdById', as: 'createdCategories' });
User.hasMany(Category, { foreignKey: 'updatedById', as: 'updatedCategories' });
User.hasMany(Community, { foreignKey: 'ownerId', as: 'ownedCommunities' });
User.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
User.hasMany(Room, { foreignKey: 'adminId', as: 'adminRooms' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'messages' });

// Post associations
Post.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Category associations
Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });
Category.belongsTo(User, { foreignKey: 'createdById', as: 'createdBy' });
Category.belongsTo(User, { foreignKey: 'updatedById', as: 'updatedBy' });

// Community associations
Community.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });
Community.hasMany(User, { foreignKey: 'communityId', as: 'members' });
Community.hasMany(Room, { foreignKey: 'communityId', as: 'rooms' });

// Room associations
Room.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
Room.belongsTo(Community, { foreignKey: 'communityId', as: 'community' });
Room.hasMany(Message, { foreignKey: 'roomId', as: 'messages' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(Room, { foreignKey: 'roomId', as: 'room' });

// Many-to-many associations for User-Room membership
const UserRoom = sequelize.define('UserRoom', {
  userId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  roomId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: Room,
      key: 'id'
    }
  }
}, {
  tableName: 'user_rooms',
  timestamps: true
});

User.belongsToMany(Room, { through: UserRoom, foreignKey: 'userId', as: 'rooms' });
Room.belongsToMany(User, { through: UserRoom, foreignKey: 'roomId', as: 'members' });

// Many-to-many associations for User-Post likes
const UserPostLike = sequelize.define('UserPostLike', {
  userId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: User,
      key: 'id'
    }
  },
  postId: {
    type: sequelize.Sequelize.UUID,
    references: {
      model: Post,
      key: 'id'
    }
  }
}, {
  tableName: 'user_post_likes',
  timestamps: true
});

User.belongsToMany(Post, { through: UserPostLike, foreignKey: 'userId', as: 'likedPosts' });
Post.belongsToMany(User, { through: UserPostLike, foreignKey: 'postId', as: 'likedByUsers' });

module.exports = {
  sequelize,
  User,
  Post,
  Category,
  Community,
  Room,
  Message,
  Event,
  UserRoom,
  UserPostLike
};
