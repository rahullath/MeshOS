// src/pages/api/habits/streak.js - Enhanced with more accurate streak calculation
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import HabitEntry from '../../../models/HabitEntry';
import Habit from '../../../models/Habit';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const { habitId } = req.query;
      
      // Get current date at midnight for accurate comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // If habitId is provided, calculate streak for that habit
      if (habitId) {
        // Verify that the habit exists
        const habit = await Habit.findById(habitId);
        if (!habit) {
          return res.status(404).json({ message: 'Habit not found' });
        }
        
        // Get entries sorted by date in descending order
        const entries = await HabitEntry.find({ 
          habitId, 
          date: { $lte: today },
          value: { $gt: 0 } // Only count entries with positive values
        })
        .sort({ date: -1 })
        .limit(100); // Limit to last 100 entries for performance
        
        if (entries.length === 0) {
          return res.status(200).json({ streak: 0 });
        }
        
        // Calculate streak
        let streak = 0;
        let currentDate = new Date(today);
        
        // Create a map of dates for faster lookup
        const entryDates = new Map();
        entries.forEach(entry => {
          const dateStr = entry.date.toISOString().split('T')[0];
          entryDates.set(dateStr, true);
        });
        
        // Count streak days
        while (true) {
          const dateStr = currentDate.toISOString().split('T')[0];
          
          if (entryDates.has(dateStr)) {
            streak++;
          } else {
            break; // Break on first missed day
          }
          
          // Move to previous day
          currentDate.setDate(currentDate.getDate() - 1);
          
          // Stop if we've gone too far back (safety check)
          if (streak > 365) break;
        }
        
        return res.status(200).json({ streak });
      }
      
      // If no habitId, calculate overall streak (all habits completed)
      else {
        // Get all active habits
        const habits = await Habit.find({ archived: false });
        
        if (habits.length === 0) {
          return res.status(200).json({ streak: 0 });
        }
        
        // Calculate overall streak
        let streak = 0;
        let currentDate = new Date(today);
        
        // Count streak days
        while (true) {
          // Check if all habits were completed on this day
          const completedCount = await HabitEntry.countDocuments({
            habitId: { $in: habits.map(h => h._id) },
            date: {
              $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
              $lt: new Date(currentDate.setHours(23, 59, 59, 999))
            },
            value: { $gt: 0 }
          });
          
          if (completedCount === habits.length) {
            streak++;
          } else {
            break; // Break on first day not all habits were completed
          }
          
          // Move to previous day
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() - 1);
          
          // Stop if we've gone too far back (safety check)
          if (streak > 365) break;
        }
        
        return res.status(200).json({ streak });
      }
    } catch (error) {
      console.error('Error calculating habit streak:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
