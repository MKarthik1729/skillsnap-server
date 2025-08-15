const express = require('express');
const router = express.Router();
const skills_services = require('../services/skills_services');

// Create a new skill
router.post('/', async (req, res) => {
  try {
    const result = await skills_services.create_skill(req.body);
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

// Get all skills
router.get('/', async (req, res) => {
  try {
    const { page, limit, title } = req.query;
    
    if (title) {
      // Search by title
      const result = await skills_services.get_skills_by_title(title);
      res.status(200).json(result);
    } else if (page || limit) {
      // Get with pagination
      const page_num = parseInt(page) || 1;
      const limit_num = parseInt(limit) || 10;
      const result = await skills_services.get_skills_with_pagination(page_num, limit_num);
      res.status(200).json(result);
    } else {
      // Get all skills
      const result = await skills_services.get_all_skills();
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

// Get skill by ID
router.get('/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const result = await skills_services.get_skill_by_id(skill_id);
    
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

// Update skill by ID
router.put('/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const result = await skills_services.update_skill(skill_id, req.body);
    
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

// Delete skill by ID
router.delete('/:skill_id', async (req, res) => {
  try {
    const { skill_id } = req.params;
    const result = await skills_services.delete_skill(skill_id);
    
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
