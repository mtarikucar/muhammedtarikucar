const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community'
  },
  password: {
    type: String,
    allowNull: false
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  }
}, { timestamps: true });



module.exports = mongoose.model('Users', UserSchema);;