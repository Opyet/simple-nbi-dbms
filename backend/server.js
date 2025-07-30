// backend/server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for all origins (adjust for production)
app.use(express.json()); // Body parser for JSON requests

// Routes
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);

// Basic home route
app.get('/', (req, res) => {
    res.send('Nehemiah Builders Institute Backend API is running!');
});

// Error handling middleware (optional, for more robust error handling)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Access backend at http://localhost:${PORT}`);
});