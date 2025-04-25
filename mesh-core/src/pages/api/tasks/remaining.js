// src/pages/api/tasks/remaining.js - Enhanced with category and priority filtering
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const query = { status: { $ne: 'done' } };
      
      // Filter by category if provided
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      // Filter by priority if provided
      if (req.query.priority) {
        query.priority = req.query.priority;
      }
      
      // Filter by due date
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
        }
      }
      
      // Get count of remaining tasks
      const count = await Task.countDocuments(query);
      
      // Get tasks if detailed=true
      let tasks = [];
      if (req.query.detailed === 'true') {
        tasks = await Task.find(query)
          .sort({ priority: -1, dueDate: 1 })
          .limit(parseInt(req.query.limit) || 10);
      }
      
      const response = { count };
      
      // Add tasks to response if requested
      if (req.query.detailed === 'true') {
        response.tasks = tasks;
      }
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching remaining tasks:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
