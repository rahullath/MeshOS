// mesh-core/src/pages/api/tasks/remaining.js
// Assuming this route fetches remaining tasks for the authenticated user.
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
  const { detailed, limit, category, search } = req.query; // Parameters from snippet and potential additions

  try {
    const query = { userId, completed: { $ne: true } }; // Filter by userId and not completed

    // Add filtering by category if provided
    if (category) {
        query.category = category;
    }

    // Add basic search filtering if provided (adjust field based on your Task model)
    if (search) {
        query.title = { $regex: search, $options: 'i' }; // Case-insensitive search on 'title' field
    }


    // Get count of remaining tasks
    const count = await Task.countDocuments(query);

    // Get tasks if detailed=true (from snippet)
    let tasks = [];
    if (detailed === 'true') {
      let tasksQuery = Task.find(query)
        .sort({ priority: -1, dueDate: 1 }); // Sort order from snippet

      // Apply limit if provided (from snippet)
      if (limit) {
        const limitNum = parseInt(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
          tasksQuery = tasksQuery.limit(limitNum);
        } else {
            console.warn(`Invalid limit parameter: ${limit}. Ignoring limit.`);
        }
      }

      tasks = await tasksQuery.exec();
    }

    const response = { success: true, count: count }; // Include success status

    // Add tasks to response if requested (from snippet)
    if (detailed === 'true') {
      response.data = tasks; // Use 'data' key for consistency
    }

    res.status(200).json(response);

  } catch (error) {
    console.error('Error fetching remaining tasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching remaining tasks', error: error.message });
  }
};

export default withAuth(handler);
