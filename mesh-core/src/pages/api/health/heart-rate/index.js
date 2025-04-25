// src/pages/api/health/heart-rate/index.js - CRUD for heart rate data
import dbConnect from '../../../../lib/mongodb';
import HeartRate from '../../../../models/HeartRate';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all heart rate records with optional filtering
  if (req.method === 'GET') {
    try {
      const query = { userId: req.user.id };
      
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
      
      // Min/max heart rate filtering
      if (req.query.minRate) {
        query.min = { $gte: parseInt(req.query.minRate) };
      }
      
      if (req.query.maxRate) {
        query.max = { $lte: parseInt(req.query.maxRate) };
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;  // Default 30 days
      const skip = (page - 1) * limit;
      
      // Get heart rate records with pagination
      const heartRates = await HeartRate.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await HeartRate.countDocuments(query);
      
      res.status(200).json({
        heartRates,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching heart rate records:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new heart rate record
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { date, min, max } = req.body;
      
      if (!date || min === undefined || max === undefined) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['date', 'min', 'max']
        });
      }
      
      // Validate min and max
      if (typeof min !== 'number' || isNaN(min) || min < 0) {
        return res.status(400).json({ message: 'Min heart rate must be a valid positive number' });
      }
      
      if (typeof max !== 'number' || isNaN(max) || max < 0) {
        return res.status(400).json({ message: 'Max heart rate must be a valid positive number' });
      }
      
      if (min > max) {
        return res.status(400).json({ message: 'Min heart rate cannot be greater than max heart rate' });
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
      
      // Check if heart rate record already exists for this date (upsert)
      const existingHeartRate = await HeartRate.findOne({
        userId: req.user.id,
        date: {
          $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(parsedDate.setHours(23, 59, 59, 999))
        }
      });
      
      let newHeartRate;
      
      if (existingHeartRate) {
        // Update existing heart rate record
        existingHeartRate.set({
          ...req.body,
          date: parsedDate
        });
        newHeartRate = await existingHeartRate.save();
      } else {
        // Create new heart rate record
        const heartRate = new HeartRate({
          ...req.body,
          date: parsedDate,
          userId: req.user.id
        });
        
        newHeartRate = await heartRate.save();
      }
      
      res.status(201).json(newHeartRate);
    } catch (error) {
      console.error('Error creating heart rate record:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
