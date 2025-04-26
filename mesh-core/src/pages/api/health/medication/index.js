// mesh-core/src/pages/api/health/medication/index.js
import connectToDatabase from 'lib/mongodb';
import Medication from 'models/Medication'; // Assuming Medication model exists
import withAuth from 'middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const medications = await Medication.find({ userId }).sort({ name: 1 });
        res.status(200).json({ success: true, data: medications });
      } catch (error) {
        console.error('Error fetching medications:', error);
        res.status(500).json({ success: false, message: 'Error fetching medications', error: error.message });
      }
      break;
    case 'POST':
      try {
        const medication = new Medication({ ...req.body, userId });
        const newMedication = await medication.save();
        res.status(201).json({ success: true, data: newMedication });
      } catch (error) {
        console.error('Error creating medication:', error);
        res.status(400).json({ success: false, message: 'Error creating medication', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
