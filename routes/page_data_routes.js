const express = require('express');
const router = express.Router();
const page_data_services = require('../services/page_data_services');

// Create a new page data
router.post('/', async (req, res) => {
  try {
    const result = await page_data_services.create_page_data(req.body);
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

// Get all page data
router.get('/', async (req, res) => {
  try {
    const { page, limit, title } = req.query;
    
    if (title) {
      // Search by title
      const result = await page_data_services.get_page_data_by_title(title);
      res.status(200).json(result);
    } else if (page || limit) {
      // Get with pagination
      const page_num = parseInt(page) || 1;
      const limit_num = parseInt(limit) || 10;
      const result = await page_data_services.get_page_data_with_pagination(page_num, limit_num);
      res.status(200).json(result);
    } else {
      // Get all page data
      const result = await page_data_services.get_all_page_data();
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

// Get deleted page data (must come before /:page_data_id to avoid conflicts)
router.get('/deleted/all', async (req, res) => {
  try {
    const result = await page_data_services.get_deleted_page_data();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Internal server error'
    });
  }
});

// Get page data by ID
router.get('/:page_data_id', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const result = await page_data_services.get_page_data_by_id(page_data_id);
    
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

// Update page data by ID
router.put('/:page_data_id', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const result = await page_data_services.update_page_data(page_data_id, req.body);
    
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

// Soft delete page data by ID
router.delete('/:page_data_id', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const result = await page_data_services.delete_page_data(page_data_id);
    
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

// Hard delete page data by ID (permanent deletion)
router.delete('/:page_data_id/permanent', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const result = await page_data_services.hard_delete_page_data(page_data_id);
    
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

// Restore soft deleted page data
router.patch('/:page_data_id/restore', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const result = await page_data_services.restore_page_data(page_data_id);
    
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



// Content Management Routes

// Add content to page data
router.post('/:page_data_id/content', async (req, res) => {
  try {
    const { page_data_id } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    const result = await page_data_services.add_content_to_page_data(page_data_id, content);
    
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

// Remove content from page data
router.delete('/:page_data_id/content/:content_index', async (req, res) => {
  try {
    const { page_data_id, content_index } = req.params;
    const index = parseInt(content_index);
    
    if (isNaN(index)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid content index'
      });
    }
    
    const result = await page_data_services.remove_content_from_page_data(page_data_id, index);
    
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
