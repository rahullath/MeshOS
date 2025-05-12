// mesh-core/src/backend/routes/taskRoutes.js
const express = require('express');
const router = express.Router();
const tasksController = require('../controllers/tasksController');

// Get all tasks with optional filters
router.get('/', tasksController.getAllTasks);

// Get task statistics
router.get('/stats', tasksController.getTaskStats);

// Get task by ID
router.get('/:id', tasksController.getTaskById);

// Create new task
router.post('/', tasksController.createTask);

// Update task
router.put('/:id', tasksController.updateTask);

// Delete task
router.delete('/:id', tasksController.deleteTask);

// Toggle task completion status
router.patch('/:id/toggle', tasksController.toggleTaskStatus);

// Update subtask completion status
router.patch('/:id/subtask', tasksController.updateSubtask);

module.exports = router;