import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Application from '../../../models/Application';

export default async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all applications
  if (req.method === 'GET') {
    try {
      const applications = await Application.find({}).sort({ createdAt: -1 });
      res.status(200).json(applications);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new application
  else if (req.method === 'POST') {
    try {
      const application = new Application(req.body);
      const newApplication = await application.save();
      res.status(201).json(newApplication);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
