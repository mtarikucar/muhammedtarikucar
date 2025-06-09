const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'not selected'],
    default: "not selected"
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
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'admin'],
    default: 'member'
  }
}, { timestamps: true });



module.exports = mongoose.model('User', UserSchema);;