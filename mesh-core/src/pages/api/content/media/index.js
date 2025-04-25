// src/pages/api/content/media/index.js - CRUD for watched media
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import Media from '../../../../models/Media';
import withAuth from '@/middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all media with optional filters
  if (req.method === 'GET') {
    try {
      let query = { userId: req.user.id };
      
      // Type filter
      if (req.query.type) {
        query.type = req.query.type;
      }
      
      // Genre filter
      if (req.query.genre) {
        query.genre = req.query.genre;
      }
      
      // Language filter
      if (req.query.language) {
        query.language = req.query.language;
      }
      
      // Completion status filter
      if (req.query.completed !== undefined) {
        query.completed = req.query.completed === 'true';
      }
      
      // Rating filter
      if (req.query.minRating) {
        query.rating = { $gte: parseInt(req.query.minRating) };
      }
      
      // Search by title
      if (req.query.search) {
        query.title = { $regex: req.query.search, $options: 'i' };
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;
      
      // Sorting
      const sort = {};
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        // Default sort by recently added
        sort.createdAt = -1;
      }
      
      // Execute query
      const media = await Media.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await Media.countDocuments(query);
      
      res.status(200).json({
        media,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new media entry
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { title, type } = req.body;
      
      if (!title || !type) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['title', 'type']
        });
      }
      
      // Validate type enum
      const validTypes = ['movie', 'tvshow', 'book', 'podcast'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: 'Invalid media type',
          allowed: validTypes
        });
      }
      
      // Validate rating if provided
      if (req.body.rating !== undefined) {
        const rating = parseInt(req.body.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }
        req.body.rating = rating;
      }
      
      // Create and save media entry
      const media = new Media({
        ...req.body,
        userId: req.user.id
      });
      
      const newMedia = await media.save();
      res.status(201).json(newMedia);
    } catch (error) {
      console.error('Error creating media entry:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
