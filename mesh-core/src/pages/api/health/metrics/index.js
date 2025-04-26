// mesh-core/src/pages/api/health/metrics/index.js
import connectToDatabase from '../../../../lib/mongodb';
import HealthMetric from '../../../../models/HealthMetric'; // Assuming HealthMetric model exists
import withAuth from '../../../../middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const metrics = await HealthMetric.find({ userId }).sort({ date: -1, name: 1 });
        res.status(200).json({ success: true, data: metrics });
      } catch (error) {
        console.error('Error fetching health metrics:', error);
        res.status(500).json({ success: false, message: 'Error fetching health metrics', error: error.message });
      }
      break;
    case 'POST':
      try {
        const metric = new HealthMetric({ ...req.body, userId, date: req.body.date || new Date() }); // Add userId and date
        const newMetric = await metric.save();
        res.status(201).json({ success: true, data: newMetric });
      } catch (error) {
        console.error('Error creating health metric:', error);
        res.status(400).json({ success: false, message: 'Error creating health metric', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
