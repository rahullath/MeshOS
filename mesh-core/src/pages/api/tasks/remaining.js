import dbConnect from '../../../lib/mongodb';
import Task from '../../../models/Task';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const remainingTasksCount = await Task.countDocuments({ status: { $ne: 'done' } });
      res.status(200).json({ count: remainingTasksCount });
    } catch (error) {
      console.error('Error fetching remaining tasks count:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
