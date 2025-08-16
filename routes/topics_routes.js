const express = require('express');
const router = express.Router();
const topic_services = require('../services/topic_services');
const { authenticate_token, require_editor_plus } = require('../db/jwt_authorisation');

// Create a new topic
router.post('/', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const result = await topic_services.create_topic(req.body);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Create a topic and associate it with a skill
router.post('/skill/:skill_id', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { skill_id } = req.params;
    const result = await topic_services.create_topic_with_skill(req.body, skill_id);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get all topics
router.get('/', async (req, res) => {
  try {
    const { page, limit, name } = req.query;
    
    if (name) {
      // Search by name
      const result = await topic_services.get_topics_by_name(name);
      res.status(200).json(result);
    } else if (page || limit) {
      // Get with pagination
      const page_num = parseInt(page) || 1;
      const limit_num = parseInt(limit) || 10;
      const result = await topic_services.get_topics_with_pagination(page_num, limit_num);
      res.status(200).json(result);
    } else {
      // Get all topics
      const result = await topic_services.get_all_topics();
      res.status(200).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get topics by skill ID (must come before /:topic_id to avoid conflicts)
router.get('/skill/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const result = await topic_services.get_topics_by_skill(skill_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get topic by ID
router.get('/:topic_id', async (req, res) => {
  try {
    const { topic_id } = req.params;
    const result = await topic_services.get_topic_by_id(topic_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Update topic by ID
router.put('/:topic_id', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { topic_id } = req.params;
    const result = await topic_services.update_topic(topic_id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Delete topic by ID
router.delete('/:topic_id', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { topic_id } = req.params;
    const result = await topic_services.delete_topic(topic_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Add page data to topic
router.post('/:topic_id/page-data', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { topic_id } = req.params;
    const result = await topic_services.add_page_data_to_topic(topic_id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Add code to topic
router.post('/:topic_id/codes', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { topic_id } = req.params;
    const result = await topic_services.add_code_to_topic(topic_id, req.body);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Add existing page data to topic
router.post('/:topic_id/page-data/:page_data_id', authenticate_token, require_editor_plus, async (req, res) => {
  try {
    const { topic_id, page_data_id } = req.params;
    const result = await topic_services.add_existing_page_data_to_topic(topic_id, page_data_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Add existing code to topic
router.post('/:topic_id/codes/:code_id', async (req, res) => {
  try {
    const { topic_id, code_id } = req.params;
    const result = await topic_services.add_existing_code_to_topic(topic_id, code_id);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
