const mongoose = require('mongoose');

const topic_schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  skill_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Skill',
    default: null
  },
  page_data: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PageData'
  }],
  codes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Code'
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
const Topic = mongoose.model('Topic', topic_schema);

module.exports = Topic;
