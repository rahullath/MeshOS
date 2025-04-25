// src/pages/api/tasks/[id].js - CRUD operations for a specific task
import dbConnect from '../../../lib/mongodb';
import Task from '../../../models/Task';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Task ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific task
  if (req.method === 'GET') {
    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json(task);
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a task
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate category enum if provided
      if (updates.category) {
        const validCategories = ['work', 'job_application', 'university', 'project', 'personal', 'cat', 'other'];
        if (!validCategories.includes(updates.category)) {
          return res.status(400).json({ 
            message: 'Invalid category', 
            allowed: validCategories
          });
        }
      }
      
      // Validate priority enum if provided
      if (updates.priority) {
        const validPriorities = ['low', 'medium', 'high', 'urgent'];
        if (!validPriorities.includes(updates.priority)) {
          return res.status(400).json({ 
            message: 'Invalid priority', 
            allowed: validPriorities
          });
        }
      }
      
      // Validate status enum if provided
      if (updates.status) {
        const validStatuses = ['todo', 'in_progress', 'blocked', 'done'];
        if (!validStatuses.includes(updates.status)) {
          return res.status(400).json({ 
            message: 'Invalid status', 
            allowed: validStatuses
          });
        }
        
        // If status is being set to 'done', record completion date
        if (updates.status === 'done') {
          updates.completedDate = new Date();
        } else {
          // If status is being changed from 'done' to something else, remove completion date
          updates.completedDate = null;
        }
      }
      
      // Handle due date conversion
      if (updates.dueDate) {
        try {
          updates.dueDate = new Date(updates.dueDate);
          if (isNaN(updates.dueDate.getTime())) {
            return res.status(400).json({ message: 'Invalid dueDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid dueDate format' });
        }
      }
      
      const task = await Task.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.status(200).json(task);
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a task
  else if (req.method === 'DELETE') {
    try {
      const task = await Task.findByIdAndDelete(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
