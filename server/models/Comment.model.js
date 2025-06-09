const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const commentSchema = new Mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }]
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Comments', commentSchema);