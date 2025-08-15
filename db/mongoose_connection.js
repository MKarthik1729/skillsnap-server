// Setup mongoose connection and export it
const mongoose = require('mongoose');

const connection_string =  `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@skills.7yptkom.mongodb.net/?retryWrites=true&w=majority&appName=skills`;
// console.log(connection_string);

mongoose.connect(connection_string);

const db = mongoose.connection;

db.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});

db.once('open', () => {
    console.log('Connected to MongoDB successfully');
});

module.exports = mongoose;