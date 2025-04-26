// mesh-core/src/pages/api/applications/[id].js
import connectToDatabase from '../../../lib/mongodb';
import Application from '../../../models/Application'; // Assuming Application model exists
import withAuth from '../../../middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query;
  const userId = req.userId; // Extracted from auth middleware

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Application ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const application = await Application.findOne({ _id: id, userId });
        if (!application) {
          return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, data: application });
      } catch (error) {
        console.error(`Error fetching application ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching application ${id}`, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const updatedApplication = await Application.findOneAndUpdate(
          { _id: id, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedApplication) {
          return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, data: updatedApplication });
      } catch (error) {
        console.error(`Error updating application ${id}:`, error);
        res.status(400).json({ success: false, message: `Error updating application ${id}`, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedApplication = await Application.findOneAndDelete({ _id: id, userId });
        if (!deletedApplication) {
          return res.status(404).json({ success: false, message: 'Application not found' });
        }
        res.status(200).json({ success: true, data: deletedApplication });
      } catch (error) {
        console.error(`Error deleting application ${id}:`, error);
        res.status(500).json({ success: false, message: `Error deleting application ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
