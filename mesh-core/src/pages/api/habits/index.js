// mesh-core/src/pages/api/habits/index.js
import connectToDatabase from '../../../lib/mongodb';
import Habit from '../../../models/Habit'; // Assuming Habit model exists
import withAuth from '../../../middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const habits = await Habit.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: habits });
      } catch (error) {
        console.error('Error fetching habits:', error);
        res.status(500).json({ success: false, message: 'Error fetching habits', error: error.message });
      }
      break;
    case 'POST':
      try {
        const habit = new Habit({ ...req.body, userId });
        const newHabit = await habit.save();
        res.status(201).json({ success: true, data: newHabit });
      } catch (error) {
        console.error('Error creating habit:', error);
        res.status(400).json({ success: false, message: 'Error creating habit', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
