const express = require('express');
const router = express.Router();

// Import all route modules
const skills_routes = require('./skills_routes');
const topics_routes = require('./topics_routes');
const page_data_routes = require('./page_data_routes');
const codes_routes = require('./codes_routes');

// Define route prefixes
const API_PREFIX = '/api/v1';

// Mount routes with prefixes
router.use('/api/v1/skills', skills_routes);
router.use('/api/v1/topics', topics_routes);
router.use('/api/v1/page-data', page_data_routes);
router.use('/api/v1/codes', codes_routes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillsSnap API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint - simplified version
router.get('/api/v1/docs', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'SkillsSnap API Documentation',
    endpoints: {
      skills: '/api/v1/skills',
      topics: '/api/v1/topics',
      page_data: '/api/v1/page-data',
      codes: '/api/v1/codes'
    },
    health_check: '/health',
    documentation: '/api/v1/docs'
  });
});

module.exports = router;
