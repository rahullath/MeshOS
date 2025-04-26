// mesh-core/src/pages/api/import/loop-habits.js
import connectToDatabase from '../../../lib/mongodb';
import Habit from '../../../models/Habit'; // Assuming Habit model exists
import HabitEntry from '../../../models/HabitEntry'; // Assuming HabitEntry model exists
import withAuth from '../../../middleware/withAuth';
import Papa from 'papaparse'; // Assuming PapaParse is installed and used for CSV

const handler = async (req, res) => {
  await connectToDatabase();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.userId; // Extracted from auth middleware
  const { habitsCsv, checkmarksCsv } = req.body; // Assuming CSV data is in the body

  if (!habitsCsv && !checkmarksCsv) {
      return res.status(400).json({ success: false, message: 'No CSV data provided for import' });
  }

  try {
    let importedHabitCount = 0;
    let importedEntryCount = 0;
    const habitMap = new Map(); // To map Loop habit names/IDs to Mongoose habit IDs

    // Process Habits.csv if provided
    if (habitsCsv) {
      const parsedHabits = Papa.parse(habitsCsv, { header: true, skipEmptyLines: true });

      if (parsedHabits.errors.length > 0) {
        console.error('Habits CSV parsing errors:', parsedHabits.errors);
        // Decide whether to return error or proceed with partial data
        return res.status(400).json({ success: false, message: 'Error parsing Habits CSV', errors: parsedHabits.errors });
      }

      const habitsToInsert = parsedHabits.data
        .filter(row => row.Name) // Ensure habit has a name
        .map(row => ({
          userId: userId, // Add userId
          name: row.Name,
          category: 'other', // Default category, adjust if needed
          type: row.Question ? 'positive' : 'negative', // Infer type based on question
          color: row.Color,
          loopId: row.ID // Assuming Loop provides an ID
          // Add other relevant fields from your Habit model
        }));

      if (habitsToInsert.length > 0) {
         // Insert habits, handle potential duplicates based on name + userId or loopId + userId
         // For simplicity, this example inserts new ones. A real import might check for existing.
         const insertedHabits = await Habit.insertMany(habitsToInsert, { ordered: false }); // Allow some errors to pass
         importedHabitCount = insertedHabits.length;

         // Build map for checkmarks processing
         insertedHabits.forEach(habit => {
             if (habit.loopId) {
                 habitMap.set(habit.loopId, habit._id);
             } else {
                 // Fallback mapping if no loopId, might have collisions
                 habitMap.set(habit.name, habit._id);
             }
         });
          console.log(`Imported ${importedHabitCount} habits.`);
      } else {
          console.log("No valid habits found in CSV to import.");
      }
    }

    // Process Checkmarks.csv if provided
    if (checkmarksCsv) {
        const parsedCheckmarks = Papa.parse(checkmarksCsv, { header: true, skipEmptyLines: true });

        if (parsedCheckmarks.errors.length > 0) {
            console.error('Checkmarks CSV parsing errors:', parsedCheckmarks.errors);
             // Decide whether to return error or proceed with partial data
            return res.status(400).json({ success: false, message: 'Error parsing Checkmarks CSV', errors: parsedCheckmarks.errors });
        }

        const entriesToInsert = [];
        parsedCheckmarks.data.forEach(row => {
            // Assuming checkmarks CSV has columns like 'HabitID', 'Date', 'Status' (e.g., 'x' for completed)
            const habitIdOrName = row.HabitID; // Or row.HabitName depending on CSV
            const entryDate = new Date(row.Date); // Assuming 'Date' column

            if (!habitIdOrName || isNaN(entryDate.getTime())) {
                console.warn('Skipping invalid checkmark row:', row);
                return; // Skip invalid rows
            }

            // Find the corresponding Mongoose Habit ID using the map
            const mongooseHabitId = habitMap.get(habitIdOrName);

            if (mongooseHabitId && row.Status === 'x') { // Assuming 'x' means completed
                 entriesToInsert.push({
                     userId: userId, // Add userId
                     habitId: mongooseHabitId,
                     date: entryDate,
                     completed: true, // Assuming 'x' means completed
                     // Add other relevant fields from your HabitEntry model
                 });
            } else if (!mongooseHabitId) {
                 console.warn(`Could not find matching habit for checkmark row: ${JSON.stringify(row)}. Skipping entry.`);
            }
        });


        if (entriesToInsert.length > 0) {
             // Insert entries
            const insertedEntries = await HabitEntry.insertMany(entriesToInsert, { ordered: false });
            importedEntryCount = insertedEntries.length;
            console.log(`Imported ${importedEntryCount} habit entries.`);

        } else {
             console.log("No valid checkmark entries found in CSV to import.");
        }
    }


    res.status(200).json({ success: true, message: `Import process completed. Imported ${importedHabitCount} habits and ${importedEntryCount} entries.`, importedHabitCount, importedEntryCount });

  } catch (error) {
    console.error('Loop Habit import error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during Loop Habit import', error: error.message });
  }
};

export default withAuth(handler);
