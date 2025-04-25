// src/pages/api/habits/[id]/log.js - Enhanced with better error handling
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import HabitEntry from '../../../../models/HabitEntry';
import Habit from '../../../../models/Habit';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Habit ID is required' });
  }
  
  await dbConnect();
  
  // POST - Log a habit entry
  if (req.method === 'POST') {
    try {
      // First verify that the habit exists
      const habit = await Habit.findById(id);
      if (!habit) {
        return res.status(404).json({ message: 'Habit not found' });
      }
      
      const { date = new Date(), value = 1, notes } = req.body;
      
      // Validate date format
      const entryDate = new Date(date);
      if (isNaN(entryDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      // Normalize the date to midnight to avoid time-based duplicates
      entryDate.setHours(0, 0, 0, 0);
      
      // Create or update the habit entry
      const habitEntry = await HabitEntry.findOneAndUpdate(
        { habitId: id, date: entryDate },
        { value, notes },
        { upsert: true, new: true }
      );
      
      res.status(201).json(habitEntry);
    } catch (error) {
      // Handle duplicate entry errors gracefully
      if (error.code === 11000) {
        return res.status(409).json({ 
          message: 'Entry already exists for this date',
          error: 'DUPLICATE_ENTRY'
        });
      }
      
      console.error('Error logging habit:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // GET - Get all entries for a habit
  else if (req.method === 'GET') {
    try {
      const { startDate, endDate } = req.query;
      const query = { habitId: id };
      
      // Add date range filtering if provided
      if (startDate || endDate) {
        query.date = {};
        
        if (startDate) {
          query.date.$gte = new Date(startDate);
        }
        
        if (endDate) {
          query.date.$lte = new Date(endDate);
        }
      }
      
      const entries = await HabitEntry
        .find(query)
        .sort({ date: -1 });
      
      res.status(200).json(entries);
    } catch (error) {
      console.error('Error fetching habit entries:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // DELETE - Delete a habit entry
  else if (req.method === 'DELETE') {
    try {
      const { date } = req.body;
      
      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }
      
      const entryDate = new Date(date);
      entryDate.setHours(0, 0, 0, 0);
      
      const result = await HabitEntry.deleteOne({ habitId: id, date: entryDate });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      res.status(200).json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting habit entry:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
