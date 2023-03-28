const mongoose = require('mongoose');


const communitySchema = new Mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    category: {
      type: String,
    }
  }, {
  timestamps: true
})

module.exports = mongoose.model("Community", communitySchema)