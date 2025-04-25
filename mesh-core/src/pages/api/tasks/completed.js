// src/pages/api/tasks/completed.js - Enhanced with date range filtering
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const query = { status: 'done' };
      
      // Add date range filtering
      if (req.query.startDate || req.query.endDate) {
        query.completedDate = {};
        
        if (req.query.startDate) {
          query.completedDate.$gte = new Date(req.query.startDate);
        }
        
        if (req.query.endDate) {
          query.completedDate.$lte = new Date(req.query.endDate);
        }
      }
      
      // Filter by category if provided
      if (req.query.category) {
        query.category = req.query.category;
      }
      
      // Get count of completed tasks
      const count = await Task.countDocuments(query);
      
      // Get tasks if detailed=true
      let tasks = [];
      if (req.query.detailed === 'true') {
        tasks = await Task.find(query).sort({ completedDate: -1 });
      }
      
      const response = { count };
      
      // Add tasks to response if requested
      if (req.query.detailed === 'true') {
        response.tasks = tasks;
      }
      
      res.status(200).json(response);
    } catch (error) {
      console.error('Error fetching completed tasks:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
