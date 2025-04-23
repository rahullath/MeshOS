// src/pages/api/habits/index.js
import dbConnect from '../../../lib/mongodb';
import Habit from '../../../models/Habit';

export default async function handler(req, res) {
  await dbConnect();
  
  // GET /api/habits - Get all habits
  if (req.method === 'GET') {
    try {
      const habits = await Habit.find({ archived: false });
      res.status(200).json(habits);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } 
  // POST /api/habits - Create a new habit
  else if (req.method === 'POST') {
    try {
      const habit = new Habit(req.body);
      const newHabit = await habit.save();
      res.status(201).json(newHabit);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
