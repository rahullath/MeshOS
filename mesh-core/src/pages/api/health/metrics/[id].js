// mesh-core/src/pages/api/health/metrics/[id].js
import connectToDatabase from 'lib/mongodb';
import HealthMetric from 'models/HealthMetric'; // Assuming HealthMetric model exists
import withAuth from 'middleware/withAuth';
import mongoose from 'mongoose';

const handler = async (req, res) => {
  await connectToDatabase();

  const { id } = req.query;
  const userId = req.userId; // Extracted from auth middleware

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: 'Invalid Health Metric ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const metric = await HealthMetric.findOne({ _id: id, userId });
        if (!metric) {
          return res.status(404).json({ success: false, message: 'Health metric not found' });
        }
        res.status(200).json({ success: true, data: metric });
      } catch (error) {
        console.error(`Error fetching health metric ${id}:`, error);
        res.status(500).json({ success: false, message: `Error fetching health metric ${id}`, error: error.message });
      }
      break;
    case 'PUT':
      try {
        const updatedMetric = await HealthMetric.findOneAndUpdate(
          { _id: id, userId },
          req.body,
          { new: true, runValidators: true }
        );
        if (!updatedMetric) {
          return res.status(404).json({ success: false, message: 'Health metric not found' });
        }
        res.status(200).json({ success: true, data: updatedMetric });
      } catch (error) {
        console.error(`Error updating health metric ${id}:`, error);
        res.status(400).json({ success: false, message: `Error updating health metric ${id}`, error: error.message });
      }
      break;
    case 'DELETE':
      try {
        const deletedMetric = await HealthMetric.findOneAndDelete({ _id: id, userId });
        if (!deletedMetric) {
          return res.status(404).json({ success: false, message: 'Health metric not found' });
        }
        res.status(200).json({ success: true, data: deletedMetric });
      } catch (error) {
        console.error(`Error deleting health metric ${id}:`, error);
        res.status(500).json({ success: false, message: `Error deleting health metric ${id}`, error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
