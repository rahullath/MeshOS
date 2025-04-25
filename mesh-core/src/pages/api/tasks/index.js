// src/pages/api/tasks/index.js - Enhanced with better filtering and validation - implement it
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  // Corrected: Use connectToDatabase() instead of the undefined dbConnect()
  try {
    await connectToDatabase(); 
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Failed to connect to database.' });
  }
  
  // GET - Fetch all tasks or with filters
  if (req.method === 'GET') {
    try {
      let query = {};
      
      // Basic query filters
      if (req.query.status) query.status = req.query.status;
      if (req.query.category) query.category = req.query.category;
      if (req.query.priority) query.priority = req.query.priority;
      if (req.query.project) query.project = req.query.project;
      
      // Tag filtering
      if (req.query.tag) {
        query.tags = { $in: [req.query.tag] };
      }
      
      // Search by title or description
      if (req.query.search) {
        query.$or = [
          { title: { $regex: req.query.search, $options: 'i' } },
          { description: { $regex: req.query.search, $options: 'i' } }
        ];
      }
      
      // Handle date filters
      if (req.query.due) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (req.query.due === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query.dueDate = { $gte: today, $lt: tomorrow };
        } else if (req.query.due === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          query.dueDate = { $gte: today, $lt: nextWeek };
        } else if (req.query.due === 'overdue') {
          query.dueDate = { $lt: today };
          query.status = { $ne: 'done' }; // Assuming overdue tasks are not marked as done
        } else if (req.query.due === 'future') {
          query.dueDate = { $gt: today };
        } else if (req.query.due === 'none') {
          query.dueDate = { $exists: false };
        }
      }
      
      // Parse sorting options
      const sortOptions = {};
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        sortOptions[field] = order === 'desc' ? -1 : 1;
      } else {
        // Default sorting
        sortOptions.priority = -1; // High priority first
        sortOptions.dueDate = 1;   // Earlier due dates first
        sortOptions.createdAt = -1; // Newest first
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      
      // Execute query with pagination
      const tasks = await Task.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await Task.countDocuments(query);
      
      res.status(200).json({
        tasks,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: error.message });
    }
  } 
  // POST - Create a new task
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { title, category } = req.body;
      
      if (!title || !category) {
        return res.status(400).json({ 
          message: 'Missing required fields', 
          required: ['title', 'category'] 
        });
      }
      
      // Validate category enum
      const validCategories = ['work', 'job_application', 'university', 'project', 'personal', 'cat', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({ 
          message: 'Invalid category', 
          allowed: validCategories
        });
      }
      
      // Handle due date conversion
      if (req.body.dueDate) {
        try {
          req.body.dueDate = new Date(req.body.dueDate);
          if (isNaN(req.body.dueDate.getTime())) {
            return res.status(400).json({ message: 'Invalid dueDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid dueDate format' });
        }
      }
      
      const task = new Task(req.body);
      const newTask = await task.save();
      res.status(201).json(newTask);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(400).json({ message: error.message });
    }
  } 
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
