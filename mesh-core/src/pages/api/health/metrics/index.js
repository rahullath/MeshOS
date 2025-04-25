// src/pages/api/health/metrics/index.js - CRUD for health metrics
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import HealthMetric from '../../../../models/HealthMetric';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all health metrics with optional filtering
  if (req.method === 'GET') {
    try {
      const query = {};
      
      // Date range filtering
      if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) {
          query.date.$gte = new Date(req.query.startDate);
        }
        if (req.query.endDate) {
          query.date.$lte = new Date(req.query.endDate);
        }
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;  // Default 30 days
      const skip = (page - 1) * limit;
      
      // Get metrics with pagination
      const metrics = await HealthMetric.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await HealthMetric.countDocuments(query);
      
      res.status(200).json({
        metrics,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching health metrics:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new health metric
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { date } = req.body;
      
      if (!date) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['date']
        });
      }
      
      // Parse date
      let parsedDate;
      try {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
      
      // Validate numeric fields
      const numericFields = ['weight', 'sleepHours'];
      for (const field of numericFields) {
        if (req.body[field] !== undefined) {
          if (typeof req.body[field] !== 'number' || isNaN(req.body[field])) {
            return res.status(400).json({ message: `${field} must be a valid number` });
          }
        }
      }
      
      // Check if metric already exists for this date (upsert)
      const existingMetric = await HealthMetric.findOne({
        userId: req.user.id,
        date: {
          $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(parsedDate.setHours(23, 59, 59, 999))
        }
      });
      
      let newMetric;
      
      if (existingMetric) {
        // Update existing metric
        existingMetric.set({
          ...req.body,
          date: parsedDate
        });
        newMetric = await existingMetric.save();
      } else {
        // Create new metric
        const metric = new HealthMetric({
          ...req.body,
          date: parsedDate,
          userId: req.user.id
        });
        
        newMetric = await metric.save();
      }
      
      res.status(201).json(newMetric);
    } catch (error) {
      console.error('Error creating health metric:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
