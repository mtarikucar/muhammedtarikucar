const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PostImage = sequelize.define('PostImage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'posts',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  url: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isUrl: {
        msg: 'Must be a valid URL'
      }
    }
  },
  alt: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  caption: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'post_images',
  timestamps: true,
  indexes: [
    { fields: ['postId'] },
    { fields: ['sortOrder'] }
  ]
});

module.exports = PostImage;