const mongoose = require('mongoose');

const code_schema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  code: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  deleted_at: {
    type: Date,
    default: null
  }
}, { 
  _id: true
});

// Create and export the model
const Code = mongoose.model('Code', code_schema);

module.exports = Code;
