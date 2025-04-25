import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Project from '../../../models/Project';

export default async function handler(req, res) {
  // Corrected: Use connectToDatabase() instead of the undefined dbConnect()
   try {
    await connectToDatabase(); 
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Failed to connect to database.' });
  }

  // GET - Fetch all projects
  if (req.method === 'GET') {
    try {
      const projects = await Project.find({}).sort({ createdAt: -1 });
      res.status(200).json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new project
  else if (req.method === 'POST') {
    try {
      const project = new Project(req.body);
      const newProject = await project.save();
      res.status(201).json(newProject);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
