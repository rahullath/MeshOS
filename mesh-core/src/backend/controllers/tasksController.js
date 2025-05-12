// mesh-core/src/backend/controllers/tasksController.js
const Task = require('../models/Task');
const { parseISO, addDays, addWeeks, addMonths, addYears } = require('date-fns');

// Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const { 
      status, 
      category, 
      project, 
      priority, 
      dueDate, 
      overdue, 
      search, 
      sortBy, 
      sortOrder 
    } = req.query;
    
    let query = {};
    
    // Apply filters if provided
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (project) {
      query.project = project;
    }
    
    if (priority) {
      query.priority = parseInt(priority);
    }
    
    // Filter by due date (today, tomorrow, this week, overdue)
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (dueDate === 'today') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        query.dueDate = {
          $gte: today,
          $lt: tomorrow
        };
      } else if (dueDate === 'tomorrow') {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const dayAfterTomorrow = new Date(today);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
        
        query.dueDate = {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        };
      } else if (dueDate === 'week') {
        const endOfWeek = new Date(today);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        endOfWeek.setHours(23, 59, 59, 999);
        
        query.dueDate = {
          $gte: today,
          $lte: endOfWeek
        };
      }
    }
    
    // Filter for overdue tasks
    if (overdue === 'true') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      query.dueDate = { $lt: today };
      query.status = { $ne: 'completed' };
    }
    
    // Search in title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort options
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      // Default sorting: priority tasks first, then by due date (if exists)
      sort = { priority: -1, dueDate: 1, createdAt: -1 };
    }
    
    // Execute query with pagination if needed
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    
    const tasks = await Task.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate('project', 'name');
    
    // Count total for pagination
    const total = await Task.countDocuments(query);
    
    res.status(200).json({
      tasks,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error while fetching tasks' });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('project', 'name');
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error while fetching task' });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      category, 
      project, 
      priority, 
      status, 
      dueDate, 
      subtasks, 
      tags,
      recurring,
      recurrencePattern
    } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Task title is required' });
    }
    
    const newTask = new Task({
      title,
      description,
      category: category || 'personal',
      project: project || null,
      priority: priority || 3,
      status: status || 'todo',
      dueDate: dueDate ? new Date(dueDate) : null,
      subtasks: subtasks || [],
      tags: tags || [],
      recurring: recurring || false,
      recurrencePattern: recurrencePattern || null
    });
    
    const savedTask = await newTask.save();
    
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Server error while creating task' });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      project,
      priority,
      status,
      dueDate,
      subtasks,
      tags,
      notes,
      recurring,
      recurrencePattern,
      reminders
    } = req.body;
    
    // Build update object with only provided fields
    const updates = {
      ...(title && { title }),
      ...(description !== undefined && { description }),
      ...(category && { category }),
      ...(project !== undefined && { project }),
      ...(priority !== undefined && { priority }),
      ...(status && { status }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(subtasks && { subtasks }),
      ...(tags && { tags }),
      ...(notes !== undefined && { notes }),
      ...(recurring !== undefined && { recurring }),
      ...(recurrencePattern && { recurrencePattern }),
      ...(reminders && { reminders }),
      updatedAt: new Date()
    };
    
    // If status is changing to completed, update completedAt
    if (status === 'completed') {
      updates.completedAt = new Date();
      
      // If task is recurring, create next occurrence
      const existingTask = await Task.findById(req.params.id);
      
      if (existingTask && existingTask.recurring && existingTask.recurrencePattern) {
        await createRecurringTask(existingTask);
      }
    } else if (status && status !== 'completed') {
      // If changing from completed to another status, clear completedAt
      updates.completedAt = null;
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!updatedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error while updating task' });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    
    if (!deletedTask) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error while deleting task' });
  }
};

// Toggle task completion status
exports.toggleTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const updates = {
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date() : null,
      updatedAt: new Date()
    };
    
    // If task is being marked as completed and is recurring, create next occurrence
    if (newStatus === 'completed' && task.recurring && task.recurrencePattern) {
      await createRecurringTask(task);
    }
    
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error toggling task status:', error);
    res.status(500).json({ message: 'Server error while updating task status' });
  }
};

// Update subtask completion status
exports.updateSubtask = async (req, res) => {
  try {
    const { subtaskId, completed } = req.body;
    
    if (!subtaskId) {
      return res.status(400).json({ message: 'Subtask ID is required' });
    }
    
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Find the subtask
    const subtaskIndex = task.subtasks.findIndex(
      subtask => subtask._id.toString() === subtaskId
    );
    
    if (subtaskIndex === -1) {
      return res.status(404).json({ message: 'Subtask not found' });
    }
    
    // Update the subtask
    task.subtasks[subtaskIndex].completed = completed !== undefined ? completed : !task.subtasks[subtaskIndex].completed;
    task.subtasks[subtaskIndex].completedAt = task.subtasks[subtaskIndex].completed ? new Date() : null;
    
    // Check if all subtasks are completed and update main task status
    const allCompleted = task.subtasks.every(subtask => subtask.completed);
    if (allCompleted && task.status !== 'completed') {
      task.status = 'completed';
      task.completedAt = new Date();
      
      // If task is recurring, create next occurrence
      if (task.recurring && task.recurrencePattern) {
        await createRecurringTask(task);
      }
    } else if (!allCompleted && task.status === 'completed') {
      task.status = 'in-progress';
      task.completedAt = null;
    }
    
    task.updatedAt = new Date();
    
    await task.save();
    
    res.status(200).json(task);
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({ message: 'Server error while updating subtask' });
  }
};

// Get task statistics
exports.getTaskStats = async (req, res) => {
  try {
    // Count tasks by status
    const statusCounts = await Task.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    // Transform to object
    const statusStats = statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Count tasks by category
    const categoryCounts = await Task.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Transform to object
    const categoryStats = categoryCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    // Count overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const overdueTasks = await Task.countDocuments({
      dueDate: { $lt: today },
      status: { $ne: 'completed' }
    });
    
    // Count today's tasks
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayTasks = await Task.countDocuments({
      dueDate: {
        $gte: today,
        $lt: tomorrow
      }
    });
    
    // Stats object
    const stats = {
      total: await Task.countDocuments(),
      byStatus: statusStats,
      byCategory: categoryStats,
      overdue: overdueTasks,
      today: todayTasks,
      completed: statusStats.completed || 0,
      completionRate: statusStats.completed 
        ? Math.round((statusStats.completed / (await Task.countDocuments())) * 100) 
        : 0
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Server error while fetching task statistics' });
  }
};

// Helper function to create a recurring task
async function createRecurringTask(task) {
  try {
    // Calculate the next due date based on recurrence pattern
    let nextDueDate = null;
    
    if (task.dueDate && task.recurrencePattern) {
      const { frequency, interval } = task.recurrencePattern;
      const baseDate = new Date(task.dueDate);
      
      switch (frequency) {
        case 'daily':
          nextDueDate = addDays(baseDate, interval);
          break;
        case 'weekly':
          nextDueDate = addWeeks(baseDate, interval);
          break;
        case 'monthly':
          nextDueDate = addMonths(baseDate, interval);
          break;
        case 'yearly':
          nextDueDate = addYears(baseDate, interval);
          break;
        default:
          // For custom or undefined frequencies, default to 1 week
          nextDueDate = addWeeks(baseDate, 1);
      }
      
      // Check if we should stop recurring based on endDate
      if (task.recurrencePattern.endDate && 
          nextDueDate > new Date(task.recurrencePattern.endDate)) {
        return; // Stop recurring
      }
    } else {
      // If no due date or recurrence pattern, don't create a new task
      return;
    }
    
    // Create a new task based on the completed one
    const newTask = new Task({
      title: task.title,
      description: task.description,
      category: task.category,
      project: task.project,
      priority: task.priority,
      status: 'todo',
      dueDate: nextDueDate,
      subtasks: task.subtasks.map(subtask => ({
        title: subtask.title,
        completed: false,
        completedAt: null
      })),
      tags: task.tags,
      notes: task.notes,
      recurring: task.recurring,
      recurrencePattern: task.recurrencePattern
    });
    
    await newTask.save();
    
    return newTask;
  } catch (error) {
    console.error('Error creating recurring task:', error);
    throw error;
  }
}