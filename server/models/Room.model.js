const mongoose = require("mongoose");

const RoomSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    image: {
      type: String,
      default: null,
    },
    isCommunity:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Community",
      default:null
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Room", RoomSchema);