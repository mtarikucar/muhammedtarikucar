const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  roomId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'rooms',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'messages',
  timestamps: true
});

module.exports = Message;
