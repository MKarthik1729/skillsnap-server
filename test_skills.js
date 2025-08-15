const express = require('express');
const app = express();

// Test requiring just the skills routes
try {
  const skills_routes = require('./routes/skills_routes');
  console.log('Skills routes loaded successfully');
  
  // Mount the routes
  app.use('/api/v1/skills', skills_routes);
  console.log('Skills routes mounted successfully');
  
  // Test a simple route
  app.get('/test', (req, res) => {
    res.json({ message: 'Test route works' });
  });
  
  const port = 3002;
  app.listen(port, () => {
    console.log(`Test skills server running on port ${port}`);
  });
} catch (error) {
  console.error('Error loading skills routes:', error);
}
