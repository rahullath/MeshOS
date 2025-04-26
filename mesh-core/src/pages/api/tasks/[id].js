// mesh-core/src/pages/api/tasks/[id].js
import connectToDatabase from 'lib/mongodb';
import Task from 'models/Task'; // Assuming Task model exists
import withAuth from 'middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query;
  const userId = req.userId; // Extracted from auth middleware

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Task ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const task = await Task.findOne({ _id: id, userId });
        if (!task) {
          return res.status(404).json({ success: false, message: 'Task not found' });
        }
        res.status(200).json({ success: true, data: task });
      } catch (error) {
        console.error(`Error fetching task ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching task ${id}`, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const updates = req.body;

        // Validate category enum if provided (from snippet)
        if (updates.category) {
          const validCategories = ['work', 'job_application', 'university', 'project', 'personal', 'cat', 'other'];
          if (!validCategories.includes(updates.category)) {
            return res.status(400).json({
              success: false,
              message: `Invalid category: ${updates.category}. Valid categories are: ${validCategories.join(', ')}`
            });
          }
        }

        const updatedTask = await Task.findOneAndUpdate(
          { _id: id, userId }, // Filter by ID and userId
          updates,
          { new: true, runValidators: true }
        );

        if (!updatedTask) {
          return res.status(404).json({ success: false, message: 'Task not found or does not belong to user' });
        }
        res.status(200).json({ success: true, data: updatedTask });
      } catch (error) {
        console.error(`Error updating task ${id}:`, error);
        res.status(400).json({ success: false, message: `Error updating task ${id}`, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedTask = await Task.findOneAndDelete({ _id: id, userId }); // Filter by ID and userId
        if (!deletedTask) {
          return res.status(404).json({ success: false, message: 'Task not found or does not belong to user' });
        }
        res.status(200).json({ success: true, data: deletedTask });
      } catch (error) {
        console.error(`Error deleting task ${id}:`, error);
        res.status(500).json({ success: false, message: `Error deleting task ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
