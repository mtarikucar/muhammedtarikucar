const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    title: {
      type: String,
      
    },
    content: {
      type: String,

    },
    materials:{
      type: Array,
      "default": []
    },
    sound: {
      type: String,      
    },
    category: {
      type: String,
    },
    author:{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  }, {
  timestamps: true
}
);

module.exports = mongoose.model('Posts', productSchema);