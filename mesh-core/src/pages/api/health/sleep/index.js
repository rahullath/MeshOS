// mesh-core/src/pages/api/health/sleep/index.js
import connectToDatabase from '../../../../lib/mongodb';
import Sleep from '../../../../models/Sleep'; // Assuming Sleep model exists
import withAuth from '../../../../middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const sleepEntries = await Sleep.find({ userId }).sort({ date: -1 });
        res.status(200).json({ success: true, data: sleepEntries });
      } catch (error) {
        console.error('Error fetching sleep entries:', error);
        res.status(500).json({ success: false, message: 'Error fetching sleep entries', error: error.message });
      }
      break;
    case 'POST':
      try {
        const sleepEntry = new Sleep({ ...req.body, userId, date: req.body.date || new Date() }); // Add userId and date
        const newSleepEntry = await sleepEntry.save();
        res.status(201).json({ success: true, data: newSleepEntry });
      } catch (error) {
        console.error('Error creating sleep entry:', error);
        res.status(400).json({ success: false, message: 'Error creating sleep entry', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
