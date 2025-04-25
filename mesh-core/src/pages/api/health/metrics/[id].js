// src/pages/api/health/metrics/[id].js - CRUD for a specific health metric
import dbConnect from '../../../../lib/mongodb';
import HealthMetric from '../../../../models/HealthMetric';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Metric ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific health metric
  if (req.method === 'GET') {
    try {
      const metric = await HealthMetric.findById(id);
      
      if (!metric) {
        return res.status(404).json({ message: 'Health metric not found' });
      }
      
      res.status(200).json(metric);
    } catch (error) {
      console.error('Error fetching health metric:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a health metric
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate numeric fields
      const numericFields = ['weight', 'sleepHours'];
      for (const field of numericFields) {
        if (updates[field] !== undefined) {
          if (typeof updates[field] !== 'number' || isNaN(updates[field])) {
            return res.status(400).json({ message: `${field} must be a valid number` });
          }
        }
      }
      
      // Parse date if provided
      if (updates.date) {
        try {
          updates.date = new Date(updates.date);
          if (isNaN(updates.date.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      }
      
      // Validate activity level if provided
      if (updates.activityLevel && !['sedentary', 'light', 'moderate', 'active'].includes(updates.activityLevel)) {
        return res.status(400).json({
          message: 'Invalid activity level',
          allowed: ['sedentary', 'light', 'moderate', 'active']
        });
      }
      
      const metric = await HealthMetric.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!metric) {
        return res.status(404).json({ message: 'Health metric not found' });
      }
      
      res.status(200).json(metric);
    } catch (error) {
      console.error('Error updating health metric:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a health metric
  else if (req.method === 'DELETE') {
    try {
      const metric = await HealthMetric.findByIdAndDelete(id);
      
      if (!metric) {
        return res.status(404).json({ message: 'Health metric not found' });
      }
      
      res.status(200).json({ message: 'Health metric deleted successfully' });
    } catch (error) {
      console.error('Error deleting health metric:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
