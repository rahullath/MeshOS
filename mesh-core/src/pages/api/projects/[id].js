import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Project from '../../../models/Project';

export default async function handler(req, res) {
  const { id } = req.query;
  await dbConnect();

  // GET - Fetch a specific project
  if (req.method === 'GET') {
    try {
      const project = await Project.findById(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a project
  else if (req.method === 'PUT') {
    try {
      const project = await Project.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json(project);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a project
  else if (req.method === 'DELETE') {
    try {
      const project = await Project.findByIdAndDelete(id);
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      res.status(200).json({ message: 'Project deleted successfully' });
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
