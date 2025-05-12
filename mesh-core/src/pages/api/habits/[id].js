// mesh-core/src/pages/api/habits/[id].js
import { connectToDatabase } from '../../../lib/mongodb';
import Habit from '../../../backend/models/Habit';
import { withAuth } from '../../../middleware/withAuth';

/**
 * API handler for /api/habits/[id]
 * Supports GET, PUT, and DELETE methods
 */
async function handler(req, res) {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Get habit ID from URL
    const { id } = req.query;
    
    if (!id) {
      return res.status(400).json({ message: 'Habit ID is required' });
    }
    
    // Route handler based on HTTP method
    switch (req.method) {
      case 'GET':
        return getHabitById(req, res, id);
      case 'PUT':
        return updateHabit(req, res, id);
      case 'DELETE':
        return deleteHabit(req, res, id);
      default:
        return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

/**
 * GET /api/habits/[id] - Get a specific habit by ID
 */
async function getHabitById(req, res, id) {
  try {
    // Find habit by ID
    const habit = await Habit.findById(id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    return res.status(200).json(habit);
  } catch (error) {
    console.error(`Error fetching habit ${id}:`, error);
    return res.status(500).json({ message: 'Error fetching habit' });
  }
}

/**
 * PUT /api/habits/[id] - Update a specific habit
 */
async function updateHabit(req, res, id) {
  try {
    const { name, type, category, target, color, icon, reminderTime } = req.body;
    
    // Build update object with only provided fields
    const updates = {
      ...(name && { name }),
      ...(type && { type }),
      ...(category && { category }),
      ...(target && { target }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(reminderTime && { reminderTime })
    };
    
    // Find and update the habit
    const updatedHabit = await Habit.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true } // Return the updated document
    );
    
    if (!updatedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    return res.status(200).json(updatedHabit);
  } catch (error) {
    console.error(`Error updating habit ${id}:`, error);
    return res.status(500).json({ message: 'Error updating habit' });
  }
}

/**
 * DELETE /api/habits/[id] - Delete a specific habit
 */
async function deleteHabit(req, res, id) {
  try {
    // Find and delete the habit
    const deletedHabit = await Habit.findByIdAndDelete(id);
    
    if (!deletedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    return res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error(`Error deleting habit ${id}:`, error);
    return res.status(500).json({ message: 'Error deleting habit' });
  }
}

// Wrap the handler with authentication middleware
export default withAuth(handler);