// mesh-core/src/backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const habitRoutes = require('./routes/habitRoutes');
const taskRoutes = require('./routes/taskRoutes');
// TODO: Import other routes as they're implemented
// const mediaRoutes = require('./routes/mediaRoutes');
// const healthRoutes = require('./routes/healthRoutes');
// const financeRoutes = require('./routes/financeRoutes');
// const projectRoutes = require('./routes/projectRoutes');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/meshOS', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(morgan('dev')); // Logging

// Static files (if needed)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple API status route
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'MeshOS API is running',
    version: '1.0.0'
  });
});

// API routes
app.use('/api/habits', habitRoutes);
app.use('/api/tasks', taskRoutes);
// TODO: Register other routes as they're implemented
// app.use('/api/media', mediaRoutes);
// app.use('/api/health', healthRoutes);
// app.use('/api/finance', financeRoutes);
// app.use('/api/projects', projectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  // Handle multer errors specifically
  if (err.name === 'MulterError') {
    return res.status(400).json({
      status: 'error',
      message: `File upload error: ${err.message}`
    });
  }
  
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Something went wrong on the server'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes
