const mongoose = require('mongoose');

const skills_schema = new mongoose.Schema({
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
  topics: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Topic'
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
});

// Pre-save middleware to update the updated_at field
skills_schema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Pre-save middleware for topics to update their updated_at field
skills_schema.pre('save', function(next) {
  if (this.topics && this.topics.length > 0) {
    this.topics.forEach(topic => {
      topic.updated_at = new Date();
    });
  }
  next();
});

module.exports = mongoose.model('Skill', skills_schema);
