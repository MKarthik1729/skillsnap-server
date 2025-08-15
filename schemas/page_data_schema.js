const mongoose = require('mongoose');

const page_data_schema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  content: [{
    type: String,
    required: true
  }],
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
const PageData = mongoose.model('PageData', page_data_schema);

module.exports = PageData;
