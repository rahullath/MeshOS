// mesh-core/src/pages/api/tasks/completed.js
// Assuming this route fetches completed tasks for the authenticated user.
import connectToDatabase from 'lib/mongodb';
import Task from 'models/Task'; // Assuming Task model exists
import withAuth from 'middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.userId; // Extracted from auth middleware
  const { limit } = req.query; // Optional limit parameter

  try {
    const query = { userId, completed: true }; // Filter by userId and completed status
    let tasksQuery = Task.find(query).sort({ completedAt: -1 }); // Sort by completion date, adjust if needed

    if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
            tasksQuery = tasksQuery.limit(limitNum);
        } else {
             console.warn(`Invalid limit parameter: ${limit}. Ignoring limit.`);
        }
    }

    const tasks = await tasksQuery.exec();

    res.status(200).json({ success: true, data: tasks });

  } catch (error) {
    console.error('Error fetching completed tasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching completed tasks', error: error.message });
  }
};

export default withAuth(handler);
