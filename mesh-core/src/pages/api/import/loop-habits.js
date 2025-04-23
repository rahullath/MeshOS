import dbConnect from '../../../lib/mongodb';
import Habit from '../../../models/Habit';
import HabitEntry from '../../../models/HabitEntry';
import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { habitsCsv, checkmarksCsv } = req.body;

      // Process Habits.csv
      const parsedHabits = Papa.parse(habitsCsv, { header: true, skipEmptyLines: true });

      if (parsedHabits.errors.length > 0) {
        console.error('Habits CSV parsing errors:', parsedHabits.errors);
        return res.status(400).json({ message: 'Error parsing Habits CSV' });
      }

      const habits = parsedHabits.data.map(row => ({
        name: row.Name,
        category: 'other',
        type: row.Question ? 'positive' : 'negative', // Infer type based on question
        color: row.Color
      }));

      // Save habits to the database
      await Habit.insertMany(habits);

      // Process Checkmarks.csv
      const parsedCheckmarks = Papa.parse(checkmarksCsv, { header: true, skipEmptyLines: true });

      if (parsedCheckmarks.errors.length > 0) {
        console.error('Checkmarks CSV parsing errors:', parsedCheckmarks.errors);
        return res.status(400).json({ message: 'Error parsing Checkmarks CSV' });
      }

      const checkmarks = parsedCheckmarks.data;

      // Get all habits from the database
      const allHabits = await Habit.find({});

      // Create habit entries for each checkmark
      for (const checkmark of checkmarks) {
        const date = checkmark.Date;

        for (const habit of allHabits) {
          const value = checkmark[habit.Name];

          if (value !== undefined) {
            const habitEntry = new HabitEntry({
              habitId: habit._id,
              date: new Date(date),
              value: value === '1' ? 1 : 0 // Assuming 1 means completed
            });

            await habitEntry.save();
          }
        }
      }

      res.status(200).json({ message: 'Habits imported successfully' });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
