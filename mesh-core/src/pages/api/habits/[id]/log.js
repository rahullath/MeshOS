// mesh-core/src/pages/api/habits/[id]/log.js
// Assuming this route is for logging entries for a specific habit.
import connectToDatabase from '../../../../lib/mongodb';
import Habit from '../../../../models/Habit'; // Assuming Habit model exists
import HabitEntry from '../../../../models/HabitEntry'; // Assuming HabitEntry model exists
import withAuth from '../../../../middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query; // Habit ID
  const userId = req.userId; // Extracted from auth middleware

  // Validate Habit ID
   if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Habit ID for logging' });
  }

  switch (req.method) {
    case 'POST': // Log a new entry
      try {
        // Check if the habit exists and belongs to the user
        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
          return res.status(404).json({ success: false, message: 'Habit not found or does not belong to user' });
        }

        // Create a new habit entry
        const entry = new HabitEntry({
          habitId: id,
          userId: userId,
          date: req.body.date || new Date(), // Use provided date or current date
          notes: req.body.notes, // Optional notes
          // Add other entry fields as per your HabitEntry model
        });

        const newEntry = await entry.save();

        // Optional: Update the parent Habit document (e.g., last completed date)
        // await Habit.findByIdAndUpdate(id, { lastCompleted: newEntry.date });


        res.status(201).json({ success: true, data: newEntry });
      } catch (error) {
        console.error(`Error logging habit entry for habit ${id}:`, error);
        res.status(400).json({ success: false, message: `Error logging habit entry for habit ${id}`, error: error.message });
      }
      break;
    case 'GET': // Get entries for a specific habit
      try {
         // Check if the habit exists and belongs to the user
        const habitExists = await Habit.exists({ _id: id, userId });
         if (!habitExists) {
          return res.status(404).json({ success: false, message: 'Habit not found or does not belong to user' });
        }

        const entries = await HabitEntry.find({ habitId: id, userId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: entries });
      } catch (error) {
        console.error(`Error fetching habit entries for habit ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching habit entries for habit ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
