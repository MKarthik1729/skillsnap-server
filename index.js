// setup express server, cors, body-parser, cookie-parser, dotenv
const express = require('express');
const cors = require('cors');
const body_parser = require('body-parser');
const cookie_parser = require('cookie-parser');
const path = require('path');
require('dotenv').config();
require('./db/mongoose_connection');

const app = express();

// middleware setup
app.use(cors());
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: true }));
app.use(cookie_parser());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main dashboard page for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Import and use API routes after static files
const api_routes = require('./routes/index');
app.use('/', api_routes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`SkillsSnap Backend Server running on port ${port}`);
    console.log(`Dashboard available at: http://localhost:${port}`);
    console.log(`API available at: http://localhost:${port}/api/v1`);
    console.log(`Health check: http://localhost:${port}/health`);
});

