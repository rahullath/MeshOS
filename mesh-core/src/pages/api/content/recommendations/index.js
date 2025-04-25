// src/pages/api/content/recommendations/index.js - CRUD for content recommendations
import dbConnect from '../../../../lib/mongodb';
import Recommendation from '../../../../models/Recommendation';
import Media from '../../../../models/Media';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all recommendations with optional filters
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
      
      // Source filter
      if (req.query.source) {
        query.source = req.query.source;
      }
      
      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      
      // Execute query
      const recommendations = await Recommendation.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      // Get total count for pagination
      const total = await Recommendation.countDocuments(query);
      
      res.status(200).json({
        recommendations,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new recommendation
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
      
// src/pages/api/content/recommendations/index.js - Continuing from previous code
      // Validate type enum
      const validTypes = ['movie', 'tvshow', 'book', 'podcast'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: 'Invalid media type',
          allowed: validTypes
        });
      }
      
      // Validate source enum if provided
      if (req.body.source && !['gemini', 'manual'].includes(req.body.source)) {
        return res.status(400).json({
          message: 'Invalid recommendation source',
          allowed: ['gemini', 'manual']
        });
      }
      
      // Create and save recommendation
      const recommendation = new Recommendation({
        ...req.body,
        userId: req.user.id,
        source: req.body.source || 'manual'
      });
      
      const newRecommendation = await recommendation.save();
      res.status(201).json(newRecommendation);
    } catch (error) {
      console.error('Error creating recommendation:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
