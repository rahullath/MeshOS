// mesh-core/src/pages/api/health/heart-rate/index.js
import connectToDatabase from '../../../../lib/mongodb';
import HeartRate from '../../../../models/HeartRate'; // Assuming HeartRate model exists
import withAuth from '../../../../middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const heartRates = await HeartRate.find({ userId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: heartRates });
      } catch (error) {
        console.error('Error fetching heart rates:', error);
        res.status(500).json({ success: false, message: 'Error fetching heart rates', error: error.message });
      }
      break;
    case 'POST':
      try {
        const heartRate = new HeartRate({ ...req.body, userId, date: req.body.date || new Date() }); // Add userId and date
        const newHeartRate = await heartRate.save();
        res.status(201).json({ success: true, data: newHeartRate });
      } catch (error) {
        console.error('Error creating heart rate entry:', error);
        res.status(400).json({ success: false, message: 'Error creating heart rate entry', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
