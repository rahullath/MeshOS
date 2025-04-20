import dbConnect from '../../../lib/mongodb';
import Task from '../../../models/Task';

export default async function handler(req, res) {
  await dbConnect();
  
  // GET - Fetch all tasks or with filters
  if (req.method === 'GET') {
    try {
      let query = {};
      
      // Handle query filters
      if (req.query.status) query.status = req.query.status;
      if (req.query.category) query.category = req.query.category;
      if (req.query.priority) query.priority = req.query.priority;
      
      // Handle date filters
      if (req.query.due) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (req.query.due === 'today') {
          const tomorrow = new Date(today);
          tomorrow.setDate(tomorrow.getDate() + 1);
          query.dueDate = { $gte: today, $lt: tomorrow };
        } else if (req.query.due === 'week') {
          const nextWeek = new Date(today);
          nextWeek.setDate(nextWeek.getDate() + 7);
          query.dueDate = { $gte: today, $lt: nextWeek };
        } else if (req.query.due === 'overdue') {
          query.dueDate = { $lt: today };
          query.status = { $ne: 'done' };
        }
      }
      
      const tasks = await Task.find(query).sort({ dueDate: 1, priority: -1 });
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  } 
  // POST - Create a new task
  else if (req.method === 'POST') {
    try {
      const task = new Task(req.body);
      const newTask = await task.save();
      res.status(201).json(newTask);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  } 
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
