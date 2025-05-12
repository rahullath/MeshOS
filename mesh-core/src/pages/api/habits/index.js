// mesh-core/src/pages/api/habits/index.js
import connectToDatabase from '../../../lib/mongodb';
import Habit from '../../../models/Habit'; // Assuming Habit model exists
import withAuth from '../../../middleware/withAuth';

/**
 * API handler for /api/habits
 * Supports GET and POST methods
 */
async function handler(req, res) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    const userId = req.userId; // Extracted from auth middleware
    
    // Route handler based on HTTP method
    switch (req.method) {
      case 'GET':
        return getHabits(req, res, userId);
      case 'POST':
        return createHabit(req, res, userId);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
  }
}

/**
 * GET /api/habits - Get all habits with optional filtering
 */
async function getHabits(req, res, userId) {
  try {
    const { type, category } = req.query;
    let query = { userId };
    
    // Apply filters if provided
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    // Fetch habits from database
    const habits = await Habit.find(query).sort({ createdAt: -1 });
    
    return res.status(200).json({ success: true, data: habits || [] });
  } catch (error) {
    console.error('Error fetching habits:', error);
    return res.status(500).json({ success: false, message: 'Error fetching habits', error: error.message });
  }
}

/**
 * POST /api/habits - Create a new habit
 */
async function createHabit(req, res, userId) {
  try {
    // Validate required fields
    if (!req.body.name) {
      return res.status(400).json({ success: false, message: 'Habit name is required' });
    }
    
    // Create new habit with userId
    const habit = new Habit({ 
      ...req.body,
      userId,
      // Set defaults if not provided
      type: req.body.type || 'daily',
      category: req.body.category || 'general',
      color: req.body.color || '#3b82f6',
      icon: req.body.icon || 'check-circle'
    });
    
    const newHabit = await habit.save();
    return res.status(201).json({ success: true, data: newHabit });
  } catch (error) {
    console.error('Error creating habit:', error);
    return res.status(400).json({ success: false, message: 'Error creating habit', error: error.message });
  }
}

export default withAuth(handler);
