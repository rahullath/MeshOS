// mesh-core/src/pages/api/projects/[id].js
import connectToDatabase from '../../../lib/mongodb';
import Project from '../../../models/Project'; // Assuming Project model exists
import withAuth from '../../../middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query;
  const userId = req.userId; // Extracted from auth middleware

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Project ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const project = await Project.findOne({ _id: id, userId });
        if (!project) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, data: project });
      } catch (error) {
        console.error(`Error fetching project ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching project ${id}`, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const updatedProject = await Project.findOneAndUpdate(
          { _id: id, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedProject) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, data: updatedProject });
      } catch (error) {
        console.error(`Error updating project ${id}:`, error);
        res.status(400).json({ success: false, message: `Error updating project ${id}`, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedProject = await Project.findOneAndDelete({ _id: id, userId });
        if (!deletedProject) {
          return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.status(200).json({ success: true, data: deletedProject });
      } catch (error) {
        console.error(`Error deleting project ${id}:`, error);
        res.status(500).json({ success: false, message: `Error deleting project ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
