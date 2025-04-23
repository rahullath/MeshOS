import dbConnect from '../../../lib/mongodb';
import Task from '../../../models/Task';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const completedTasksCount = await Task.countDocuments({ status: 'done' });
      res.status(200).json({ count: completedTasksCount });
    } catch (error) {
      console.error('Error fetching completed tasks count:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
