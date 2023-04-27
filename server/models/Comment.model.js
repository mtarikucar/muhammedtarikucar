const { default: mongoose } = require("mongoose");
const Mongoose = require("mongoose");

const commentSchema = new Mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true,
      },
    content: {
      type: String,
      required: true,
    },
    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    },
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model('Comments', commentSchema);