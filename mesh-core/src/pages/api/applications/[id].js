import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Application from '../../../models/Application';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  // GET - Fetch a specific application
  if (req.method === 'GET') {
    try {
      const application = await Application.findById(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.status(200).json(application);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a application
  else if (req.method === 'PUT') {
    try {
      const application = await Application.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.status(200).json(application);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a application
  else if (req.method === 'DELETE') {
    try {
      const application = await Application.findByIdAndDelete(id);
      if (!application) {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.status(200).json({ message: 'Application deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
