const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const CommunityRequest = sequelize.define('CommunityRequest', {
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
  communityId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'communities',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
    defaultValue: 'pending'
  }
}, {
  tableName: 'community_requests',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['communityId'] },
    { fields: ['status'] }
  ]
});

module.exports = CommunityRequest;