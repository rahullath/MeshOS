// mesh-core/src/pages/api/import/loop-habits.js
import connectToDatabase from '../../../lib/mongodb';
import Habit from '../../../models/Habit'; // Assuming Habit model exists
import HabitEntry from '../../../models/HabitEntry'; // Assuming HabitEntry model exists
import withAuth from '../../../middleware/withAuth';
import Papa from 'papaparse'; // Assuming PapaParse is installed and used for CSV

const handler = async (req, res) => {
  await connectToDatabase();
  const userId = req.userId;

  const { habitsCsv, checkmarksCsv } = req.body;

  if (!habitsCsv && !checkmarksCsv) {
    return res.status(400).json({ success: false, message: 'At least one of habitsCsv or checkmarksCsv is required' });
  }

  try {
    let habitsImported = 0;
    let entriesImported = 0;
    const habitMap = new Map();

    // Process habits if provided
    if (habitsCsv) {
      const parsedHabits = Papa.parse(habitsCsv, { header: true, skipEmptyLines: true });
      
      if (parsedHabits.errors.length > 0) {
        return res.status(400).json({ success: false, message: 'Error parsing habits CSV', errors: parsedHabits.errors });
      }
      
      const habitsToInsert = parsedHabits.data
        .filter(row => row.Name)
        .map(row => ({
          userId,
          name: row.Name,
          category: row.Category || 'general',
          type: row.Type === 'negative' ? 'negative' : 'positive',
          frequency: row.Frequency || 'daily',
          color: row.Color || '#4287f5',
          loopId: row.ID
        }));
      
      if (habitsToInsert.length > 0) {
        const insertedHabits = await Habit.insertMany(habitsToInsert);
        habitsImported = insertedHabits.length;
        
        // Build map for checkmarks processing
        insertedHabits.forEach(habit => {
          if (habit.loopId) {
            habitMap.set(habit.loopId, habit._id);
          } else {
            habitMap.set(habit.name, habit._id);
          }
        });
      }
    }

    // Process checkmarks if provided
    if (checkmarksCsv) {
      const parsedCheckmarks = Papa.parse(checkmarksCsv, { header: true, skipEmptyLines: true });
      
      if (parsedCheckmarks.errors.length > 0) {
        return res.status(400).json({ success: false, message: 'Error parsing checkmarks CSV', errors: parsedCheckmarks.errors });
      }
      
      const entriesToInsert = [];
      
      parsedCheckmarks.data.forEach(row => {
        const habitIdOrName = row.HabitID || row.HabitName;
        const entryDate = new Date(row.Date);
        
        if (!habitIdOrName || isNaN(entryDate.getTime())) {
          return;
        }
        
        const habitId = habitMap.get(habitIdOrName);
        
        if (habitId && row.Status === 'x') {
          entriesToInsert.push({
            userId,
            habitId,
            date: entryDate,
            value: 1
          });
        }
      });
      
      if (entriesToInsert.length > 0) {
        const insertedEntries = await HabitEntry.insertMany(entriesToInsert);
        entriesImported = insertedEntries.length;
      }
    }

    res.status(200).json({ 
      success: true, 
      message: 'Habits data imported successfully',
      imported: {
        habits: habitsImported,
        entries: entriesImported
      }
    });
  } catch (error) {
    console.error('Habits import error:', error);
    res.status(500).json({ success: false, message: 'Error importing habits data', error: error.message });
  }
};
