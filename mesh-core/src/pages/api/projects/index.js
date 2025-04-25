import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Project from '../../../models/Project';

export default async function handler(req, res) {
  try {
    await connectToDatabase(); 
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ message: 'Failed to connect to database.' });
  }

  // GET - Fetch all projects with pagination
  if (req.method === 'GET') {
    try {
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10; // Default limit to 10 projects per page
      const skip = (page - 1) * limit;
      
      // Fetch projects with pagination and sorting
      const projects = await Project.find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await Project.countDocuments({});

      res.status(200).json({
        projects,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
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
