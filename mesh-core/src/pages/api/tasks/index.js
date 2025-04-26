// mesh-core/src/pages/api/tasks/index.js
import connectToDatabase from 'lib/mongodb';
import Task from 'models/Task'; // Assuming Task model exists
import withAuth from 'middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const tasks = await Task.find({ userId }).sort({ dueDate: 1, priority: -1 }); // Example sort
        res.status(200).json({ success: true, data: tasks });
      } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ success: false, message: 'Error fetching tasks', error: error.message });
      }
      break;
    case 'POST':
      try {
        const task = new Task({ ...req.body, userId });
        const newTask = await task.save();
        res.status(201).json({ success: true, data: newTask });
      } catch (error) {
        console.error('Error creating task:', error);
        res.status(400).json({ success: false, message: 'Error creating task', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
