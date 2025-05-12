// mesh-core/src/backend/controllers/habitsController.js
const Habit = require('../models/Habit');
const { parseISO, isSameDay, format, subDays } = require('date-fns');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Helper function to calculate streak
const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;

  // Sort history by date in descending order
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Check if the most recent entry is today or yesterday (to maintain streak)
  const mostRecentDate = new Date(sortedHistory[0].date);
  const today = new Date();
  const yesterday = subDays(today, 1);
  
  if (!isSameDay(mostRecentDate, today) && !isSameDay(mostRecentDate, yesterday)) {
    return 0;
  }

  // Calculate streak
  let streak = sortedHistory[0].completed ? 1 : 0;
  let currentDate = mostRecentDate;

  for (let i = 1; i < sortedHistory.length; i++) {
    const entryDate = new Date(sortedHistory[i].date);
    const expectedDate = subDays(currentDate, 1);
    
    // If this entry is the expected previous day and was completed
    if (isSameDay(entryDate, expectedDate) && sortedHistory[i].completed) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }

  return streak;
};

// Get all habits
exports.getAllHabits = async (req, res) => {
  try {
    const { type, category } = req.query;
    let query = {};
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    if (category) {
      query.category = category;
    }
    
    const habits = await Habit.find(query).sort({ createdAt: -1 });
    
    // Calculate and add current streak to each habit
    const habitsWithStreaks = habits.map(habit => {
      const currentStreak = calculateStreak(habit.history);
      return {
        ...habit._doc,
        currentStreak
      };
    });
    
    res.status(200).json(habitsWithStreaks);
  } catch (error) {
    console.error('Error fetching habits:', error);
    res.status(500).json({ message: 'Server error while fetching habits' });
  }
};

// Get habit by ID
exports.getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Calculate current streak
    const currentStreak = calculateStreak(habit.history);
    
    res.status(200).json({
      ...habit._doc,
      currentStreak
    });
  } catch (error) {
    console.error('Error fetching habit:', error);
    res.status(500).json({ message: 'Server error while fetching habit' });
  }
};

// Create new habit
exports.createHabit = async (req, res) => {
  try {
    const { name, type, category, target, color, icon } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ message: 'Name and type are required' });
    }
    
    const newHabit = new Habit({
      name,
      type,
      category: category || 'general',
      target: target || { value: 1, unit: 'times' },
      color: color || '#3b82f6',
      icon: icon || 'check-circle',
      history: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (error) {
    console.error('Error creating habit:', error);
    res.status(500).json({ message: 'Server error while creating habit' });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const { name, type, category, target, color, icon, reminderTime } = req.body;
    const updates = {
      ...(name && { name }),
      ...(type && { type }),
      ...(category && { category }),
      ...(target && { target }),
      ...(color && { color }),
      ...(icon && { icon }),
      ...(reminderTime && { reminderTime }),
      updatedAt: new Date()
    };
    
    const updatedHabit = await Habit.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    );
    
    if (!updatedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Calculate current streak
    const currentStreak = calculateStreak(updatedHabit.history);
    
    res.status(200).json({
      ...updatedHabit._doc,
      currentStreak
    });
  } catch (error) {
    console.error('Error updating habit:', error);
    res.status(500).json({ message: 'Server error while updating habit' });
  }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
  try {
    const deletedHabit = await Habit.findByIdAndDelete(req.params.id);
    
    if (!deletedHabit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    res.status(200).json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Error deleting habit:', error);
    res.status(500).json({ message: 'Server error while deleting habit' });
  }
};

// Complete habit for today
exports.completeHabit = async (req, res) => {
  try {
    const { completed, notes, value } = req.body;
    const today = new Date();
    
    const habit = await Habit.findById(req.params.id);
    
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    
    // Check if there's already an entry for today
    const todayIndex = habit.history.findIndex(entry => 
      isSameDay(new Date(entry.date), today)
    );
    
    if (todayIndex >= 0) {
      // Update existing entry for today
      habit.history[todayIndex] = {
        ...habit.history[todayIndex],
        completed: completed !== undefined ? completed : habit.history[todayIndex].completed,
        notes: notes || habit.history[todayIndex].notes,
        value: value || habit.history[todayIndex].value
      };
    } else {
      // Create a new entry for today
      habit.history.push({
        date: today,
        completed: completed !== undefined ? completed : true,
        notes: notes || '',
        value: value || 1
      });
    }
    
    habit.updatedAt = today;
    const updatedHabit = await habit.save();
    
    // Calculate current streak
    const currentStreak = calculateStreak(updatedHabit.history);
    
    res.status(200).json({
      ...updatedHabit._doc,
      currentStreak
    });
  } catch (error) {
    console.error('Error completing habit:', error);
    res.status(500).json({ message: 'Server error while completing habit' });
  }
};

// Get habit statistics
exports.getHabitStats = async (req, res) => {
  try {
    const habits = await Habit.find();
    
    const stats = {
      total: habits.length,
      byType: {
        daily: habits.filter(h => h.type === 'daily').length,
        weekly: habits.filter(h => h.type === 'weekly').length,
        monthly: habits.filter(h => h.type === 'monthly').length
      },
      byCategory: {},
      completionRate: 0
    };
    
    // Calculate completion rate for the last 7 days
    let totalEntries = 0;
    let completedEntries = 0;
    
    habits.forEach(habit => {
      // Add to category stats
      if (habit.category) {
        stats.byCategory[habit.category] = (stats.byCategory[habit.category] || 0) + 1;
      }
      
      // Calculate completion rate
      const last7Days = habit.history.filter(entry => {
        const entryDate = new Date(entry.date);
        const sevenDaysAgo = subDays(new Date(), 7);
        return entryDate >= sevenDaysAgo;
      });
      
      totalEntries += last7Days.length;
      completedEntries += last7Days.filter(entry => entry.completed).length;
    });
    
    stats.completionRate = totalEntries > 0 
      ? Math.round((completedEntries / totalEntries) * 100) 
      : 0;
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching habit stats:', error);
    res.status(500).json({ message: 'Server error while fetching habit statistics' });
  }
};

// Import habits from CSV
exports.importFromCSV = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No CSV file provided' });
    }
    
    const results = [];
    const createdHabits = [];
    
    // Parse CSV file
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Process each row from CSV
          for (const row of results) {
            // Extract data from CSV row (adjust field names based on Loop Habits export format)
            const habitData = {
              name: row.name || row.habit_name || 'Unnamed Habit',
              type: row.frequency || 'daily',
              category: row.category || 'imported',
              target: { 
                value: parseInt(row.target_value || '1', 10),
                unit: row.target_unit || 'times'
              },
              history: []
            };
            
            // Process history if available
            if (row.history) {
              try {
                const historyData = JSON.parse(row.history);
                habitData.history = historyData;
              } catch (e) {
                console.error('Error parsing history data:', e);
              }
            }
            
            // Create new habit
            const newHabit = new Habit({
              ...habitData,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            
            const savedHabit = await newHabit.save();
            createdHabits.push(savedHabit);
          }
          
          // Clean up the uploaded file
          fs.unlinkSync(req.file.path);
          
          res.status(201).json({ 
            message: `Successfully imported ${createdHabits.length} habits`,
            habits: createdHabits
          });
        } catch (error) {
          console.error('Error processing CSV data:', error);
          res.status(500).json({ message: 'Error processing CSV data' });
        }
      });
  } catch (error) {
    console.error('Error importing habits from CSV:', error);
    res.status(500).json({ message: 'Server error while importing habits' });
  }
};
