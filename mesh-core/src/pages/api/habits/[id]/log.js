// src/pages/api/habits/[id]/log.js
import dbConnect from '../../../../lib/mongodb';
import HabitEntry from '../../../../models/HabitEntry';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();
  
  // POST /api/habits/:id/log - Log a habit entry
  if (req.method === 'POST') {
    try {
      const habitEntry = new HabitEntry({
        habitId: id,
        date: req.body.date || new Date(),
        value: req.body.value || 1,
        notes: req.body.notes
      });
      
      const newEntry = await habitEntry.save();
      res.status(201).json(newEntry);
    } catch (error) {
      // Handle duplicate entry
      if (error.code === 11000) {
        return res.status(400).json({ message: 'Entry already exists for this date' });
      }
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
