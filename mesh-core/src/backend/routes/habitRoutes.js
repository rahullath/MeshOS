// mesh-core/src/backend/routes/habitRoutes.js
const express = require('express');
const router = express.Router();
const habitsController = require('../controllers/habitsController');
const multer = require('multer');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only CSV files
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Get all habits with optional type filter
router.get('/', habitsController.getAllHabits);

// Get habit statistics
router.get('/stats', habitsController.getHabitStats);

// Get habit by ID
router.get('/:id', habitsController.getHabitById);

// Create new habit
router.post('/', habitsController.createHabit);

// Update habit
router.put('/:id', habitsController.updateHabit);

// Delete habit
router.delete('/:id', habitsController.deleteHabit);

// Mark habit complete/incomplete for today
router.post('/:id/complete', habitsController.completeHabit);

// Import habits from CSV
router.post('/import', upload.single('csv'), habitsController.importFromCSV);

module.exports = router;