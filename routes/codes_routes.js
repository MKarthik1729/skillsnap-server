const express = require('express');
const router = express.Router();
const code_services = require('../services/code_services');

// Create a new code
router.post('/', async (req, res) => {
  try {
    const result = await code_services.create_code(req.body);
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

// Get all codes
router.get('/', async (req, res) => {
  try {
    const { page, limit, language, description, languages } = req.query;
    
    if (language) {
      // Search by language
      const result = await code_services.get_codes_by_language(language);
      res.status(200).json(result);
    } else if (description) {
      // Search by description
      const result = await code_services.get_codes_by_description(description);
      res.status(200).json(result);
    } else if (page || limit) {
      // Get with pagination
      const page_num = parseInt(page) || 1;
      const limit_num = parseInt(limit) || 10;
      const result = await code_services.get_codes_with_pagination(page_num, limit_num);
      res.status(200).json(result);
    } else {
      // Get all codes
      const result = await code_services.get_all_codes();
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

// Get all unique languages (must come before /:code_id to avoid conflicts)
router.get('/languages/all', async (req, res) => {
  try {
    const result = await code_services.get_all_languages();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get deleted codes (must come before /:code_id to avoid conflicts)
router.get('/deleted/all', async (req, res) => {
  try {
    const result = await code_services.get_deleted_codes();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get code by ID
router.get('/:code_id', async (req, res) => {
  try {
    const { code_id } = req.params;
    const result = await code_services.get_code_by_id(code_id);
    
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

// Update code by ID
router.put('/:code_id', async (req, res) => {
  try {
    const { code_id } = req.params;
    const result = await code_services.update_code(code_id, req.body);
    
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

// Soft delete code by ID
router.delete('/:code_id', async (req, res) => {
  try {
    const { code_id } = req.params;
    const result = await code_services.delete_code(code_id);
    
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

// Hard delete code by ID (permanent deletion)
router.delete('/:code_id/permanent', async (req, res) => {
  try {
    const { code_id } = req.params;
    const result = await code_services.hard_delete_code(code_id);
    
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

// Restore soft deleted code
router.patch('/:code_id/restore', async (req, res) => {
  try {
    const { code_id } = req.params;
    const result = await code_services.restore_code(code_id);
    
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



// Update code content only
router.patch('/:code_id/content', async (req, res) => {
  try {
    const { code_id } = req.params;
    const { code: new_code_content } = req.body;
    
    if (!new_code_content) {
      return res.status(400).json({
        success: false,
        message: 'Code content is required'
      });
    }
    
    const result = await code_services.update_code_content(code_id, new_code_content);
    
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
