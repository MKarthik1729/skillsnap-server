const express = require('express');
const app = express();

// Test basic route
app.get('/test', (req, res) => {
  res.json({ message: 'Test route works' });
});

// Test route with parameter
app.get('/test/:id', (req, res) => {
  res.json({ message: 'Test route with parameter works', id: req.params.id });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
});
