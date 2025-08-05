const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  parentCommentId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'comments',
      key: 'id'
    }
  },
  isApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  likedBy: {
    type: DataTypes.ARRAY(DataTypes.UUID),
    defaultValue: []
  }
}, {
  tableName: 'comments',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['postId'] },
    { fields: ['parentCommentId'] },
    { fields: ['isApproved'] }
  ]
});

module.exports = Comment;