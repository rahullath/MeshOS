// src/pages/api/habits/[id].js - CRUD operations for a specific habit
import dbConnect from '../../../lib/mongodb';
import Habit from '../../../models/Habit';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Habit ID is required' });
  }
  
  await dbConnect();
  
  // GET - Get a specific habit
  if (req.method === 'GET') {
    try {
      const habit = await Habit.findById(id);
      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      res.status(200).json(habit);
    } catch (error) {
      console.error('Error fetching habit:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a habit
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate type enum if provided
      if (updates.type && !['positive', 'negative'].includes(updates.type)) {
        return res.status(400).json({ 
          message: 'Invalid habit type', 
          allowed: ['positive', 'negative'] 
        });
      }
      
      // Validate frequency enum if provided
      if (updates.frequency && !['daily', 'weekly'].includes(updates.frequency)) {
        return res.status(400).json({ 
          message: 'Invalid frequency', 
          allowed: ['daily', 'weekly'] 
        });
      }
      
      const habit = await Habit.findByIdAndUpdate(id, updates, {
        new: true, // Return the updated document
        runValidators: true, // Run validators defined in the model
      });
      
      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      res.status(200).json(habit);
    } catch (error) {
      console.error('Error updating habit:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a habit (actually archive it)
  else if (req.method === 'DELETE') {
    try {
      // Instead of permanently deleting, archive the habit
      const habit = await Habit.findByIdAndUpdate(id, { archived: true }, { new: true });
      
      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      res.status(200).json({ message: 'Habit archived successfully' });
    } catch (error) {
      console.error('Error archiving habit:', error);
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
