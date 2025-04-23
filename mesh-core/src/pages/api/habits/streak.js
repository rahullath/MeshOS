import dbConnect from '../../../lib/mongodb';
import HabitEntry from '../../../models/HabitEntry';
import Habit from '../../../models/Habit';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get the current date
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      // Find the most recent habit entry for each habit
      const habits = await Habit.find({});
      let currentStreak = 0;

      for (const habit of habits) {
        const mostRecentEntry = await HabitEntry.findOne({ habitId: habit._id, date: { $lte: currentDate } })
          .sort({ date: -1 })
          .limit(1);

        if (mostRecentEntry && mostRecentEntry.date.getTime() === currentDate.getTime()) {
          currentStreak++;
        }
      }

      res.status(200).json({ streak: currentStreak });
    } catch (error) {
      console.error('Error fetching habit streak:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
