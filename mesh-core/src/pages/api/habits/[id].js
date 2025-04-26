// mesh-core/src/pages/api/habits/[id].js
import connectToDatabase from 'lib/mongodb';
import Habit from 'models/Habit'; // Assuming Habit model exists
import withAuth from 'middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query;
  const userId = req.userId; // Extracted from auth middleware

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Habit ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const habit = await Habit.findOne({ _id: id, userId });
        if (!habit) {
          return res.status(404).json({ success: false, message: 'Habit not found' });
        }
        res.status(200).json({ success: true, data: habit });
      } catch (error) {
        console.error(`Error fetching habit ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching habit ${id}`, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const updatedHabit = await Habit.findOneAndUpdate(
          { _id: id, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedHabit) {
          return res.status(404).json({ success: false, message: 'Habit not found' });
        }
        res.status(200).json({ success: true, data: updatedHabit });
      } catch (error) {
        console.error(`Error updating habit ${id}:`, error);
        res.status(400).json({ success: false, message: `Error updating habit ${id}`, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedHabit = await Habit.findOneAndDelete({ _id: id, userId });
        if (!deletedHabit) {
          return res.status(404).json({ success: false, message: 'Habit not found' });
        }
        res.status(200).json({ success: true, data: deletedHabit });
      } catch (error) {
        console.error(`Error deleting habit ${id}:`, error);
        res.status(500).json({ success: false, message: `Error deleting habit ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
