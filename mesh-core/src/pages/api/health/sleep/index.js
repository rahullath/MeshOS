// src/pages/api/health/sleep/index.js - CRUD for sleep tracking
import dbConnect from '../../../../lib/mongodb';
import Sleep from '../../../../models/Sleep';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all sleep records with optional filtering
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
      
      // Hours range filtering
      if (req.query.minHours || req.query.maxHours) {
        query.hours = {};
        if (req.query.minHours) {
          query.hours.$gte = parseFloat(req.query.minHours);
        }
        if (req.query.maxHours) {
          query.hours.$lte = parseFloat(req.query.maxHours);
        }
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 30;  // Default 30 days
      const skip = (page - 1) * limit;
      
      // Get sleep records with pagination
      const sleepRecords = await Sleep.find(query)
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await Sleep.countDocuments(query);
      
      res.status(200).json({
        sleepRecords,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching sleep records:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new sleep record
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { date, hours } = req.body;
      
      if (!date || hours === undefined) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['date', 'hours']
        });
      }
      
      // Validate hours
      if (typeof hours !== 'number' || isNaN(hours) || hours < 0 || hours > 24) {
        return res.status(400).json({ message: 'Hours must be a valid number between 0 and 24' });
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
      
      // Check if sleep record already exists for this date (upsert)
      const existingSleep = await Sleep.findOne({
        userId: req.user.id,
        date: {
          $gte: new Date(parsedDate.setHours(0, 0, 0, 0)),
          $lt: new Date(parsedDate.setHours(23, 59, 59, 999))
        }
      });
      
      let newSleep;
      
      if (existingSleep) {
        // Update existing sleep record
        existingSleep.set({
          ...req.body,
          date: parsedDate
        });
        newSleep = await existingSleep.save();
      } else {
        // Create new sleep record
        const sleep = new Sleep({
          ...req.body,
          date: parsedDate,
          userId: req.user.id
        });
        
        newSleep = await sleep.save();
      }
      
      res.status(201).json(newSleep);
    } catch (error) {
      console.error('Error creating sleep record:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
