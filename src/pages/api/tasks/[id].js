import dbConnect from '../../../lib/mongodb';
import Task from '../../../models/Task';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();
  
  // GET - Fetch a specific task
  if (req.method === 'GET') {
    try {
      const task = await Task.findById(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json(task);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a task
  else if (req.method === 'PUT') {
    try {
      const task = await Task.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });
      
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      
      res.status(200).json(task);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a task
  else if (req.method === 'DELETE') {
    try {
      const task = await Task.findByIdAndDelete(id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
