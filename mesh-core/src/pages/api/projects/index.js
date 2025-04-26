// mesh-core/src/pages/api/projects/index.js
import connectToDatabase from '../../../lib/mongodb';
import Project from '../../../models/Project'; // Assuming Project model exists
import withAuth from '../../../middleware/withAuth';

const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const projects = await Project.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: projects });
      } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ success: false, message: 'Error fetching projects', error: error.message });
      }
      break;
    case 'POST':
      try {
        const project = new Project({ ...req.body, userId });
        const newProject = await project.save();
        res.status(201).json({ success: true, data: newProject });
      } catch (error) {
        console.error('Error creating project:', error);
        res.status(400).json({ success: false, message: 'Error creating project', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);
