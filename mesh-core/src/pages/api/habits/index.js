// src/pages/api/habits/index.js - Enhanced with better validation and error handling
import dbConnect from '../../../lib/mongodb';
import Habit from '../../../models/Habit';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();
  
  // GET /api/habits - Get all habits
  if (req.method === 'GET') {
    try {
      // Add query filtering capabilities
      const filter = { archived: false };
      
      // Filter by category if provided
      if (req.query.category) {
        filter.category = req.query.category;
      }
      
      // Filter by type if provided
      if (req.query.type) {
        filter.type = req.query.type;
      }
      
      // Filter by frequency if provided
      if (req.query.frequency) {
        filter.frequency = req.query.frequency;
      }
      
      const habits = await Habit.find(filter).sort({ createdAt: -1 });
      res.status(200).json(habits);
    } catch (error) {
      console.error('Error fetching habits:', error);
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  } 
  // POST /api/habits - Create a new habit
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { name, category, type } = req.body;
      
      if (!name || !category || !type) {
        return res.status(400).json({ 
          message: 'Missing required fields', 
          required: ['name', 'category', 'type'] 
        });
      }
      
      // Validate type enum
      if (!['positive', 'negative'].includes(type)) {
        return res.status(400).json({ 
          message: 'Invalid habit type', 
          allowed: ['positive', 'negative'] 
        });
      }
      
      const habit = new Habit(req.body);
      const newHabit = await habit.save();
      res.status(201).json(newHabit);
    } catch (error) {
      console.error('Error creating habit:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
