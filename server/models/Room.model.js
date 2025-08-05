const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Room = sequelize.define('Room', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  adminId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null
  },
  communityId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'communities',
      key: 'id'
    }
  }
}, {
  tableName: 'rooms',
  timestamps: true
});

module.exports = Room;