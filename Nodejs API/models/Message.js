// Nodejs API/models/Message.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
  fromUserId: {
    type: String,
    required: true,
  },
  toUserId: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  // ✅ New fields for file metadata
  isFile: {
    type: Boolean,
    default: false,
  },
  fileType: {
    type: String,
    default: null,
  },
  fileName: {
    type: String,
    default: null,
  }
});

module.exports = mongoose.model('Message', MessageSchema);
