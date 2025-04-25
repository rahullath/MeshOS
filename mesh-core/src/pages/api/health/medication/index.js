// src/pages/api/health/medication/index.js - CRUD for medication tracking
import dbConnect from '../../../../lib/mongodb';
import Medication from '../../../../models/Medication';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all medications
  if (req.method === 'GET') {
    try {
      const medications = await Medication.find({ userId: req.user.id })
        .sort({ name: 1 });
      
      res.status(200).json(medications);
    } catch (error) {
      console.error('Error fetching medications:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new medication
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { name } = req.body;
      
      if (!name) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['name']
        });
      }
      
      // Parse dates if provided
      if (req.body.startDate) {
        try {
          req.body.startDate = new Date(req.body.startDate);
          if (isNaN(req.body.startDate.getTime())) {
            return res.status(400).json({ message: 'Invalid startDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid startDate format' });
        }
      }
      
      if (req.body.endDate) {
        try {
          req.body.endDate = new Date(req.body.endDate);
          if (isNaN(req.body.endDate.getTime())) {
            return res.status(400).json({ message: 'Invalid endDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid endDate format' });
        }
      }
      
      // Validate that endDate is after startDate if both are provided
      if (req.body.startDate && req.body.endDate && req.body.startDate > req.body.endDate) {
        return res.status(400).json({ message: 'endDate must be after startDate' });
      }
      
      // Create medication
      const medication = new Medication({
        ...req.body,
        userId: req.user.id
      });
      
      const newMedication = await medication.save();
      res.status(201).json(newMedication);
    } catch (error) {
      console.error('Error creating medication:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
