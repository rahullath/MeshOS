// mesh-core/src/pages/api/applications/index.js
import connectToDatabase from 'lib/mongodb';
import Application from 'models/Application'; // Assuming Application model exists
import withAuth from 'middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const applications = await Application.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
      } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
      }
      break;
    case 'POST':
      try {
        const application = new Application({ ...req.body, userId });
        const newApplication = await application.save();
        res.status(201).json({ success: true, data: newApplication });
      } catch (error) {
        console.error('Error creating application:', error);
        res.status(400).json({ success: false, message: 'Error creating application', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
