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
     
      // Validate type enum
      const validTypes = ['movie', 'tvshow', 'book', 'podcast', 'music', 'game', 'other'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          message: 'Invalid type',
          validTypes
        });
      }
      
      // Check if recommendation already exists
      const existingRecommendation = await Recommendation.findOne({
        title: title,
        type: type,
        userId: req.user.id
      });
      
      if (existingRecommendation) {
        return res.status(409).json({
          message: 'Recommendation already exists',
          recommendation: existingRecommendation
        });
      }
      
      // Create new recommendation
      const recommendation = new Recommendation({
        ...req.body,
        userId: req.user.id,
        status: req.body.status || 'pending', // Default status
        priority: req.body.priority || 'medium', // Default priority
        createdAt: new Date()
      });
      
      // Save recommendation
      await recommendation.save();
      
      // If there's a related media, update its reference
      if (req.body.mediaId) {
        const media = await Media.findById(req.body.mediaId);
        if (media) {
          media.recommendationId = recommendation._id;
          await media.save();
        }
      }
      
      res.status(201).json({
        message: 'Recommendation created successfully',
        recommendation
      });
    } catch (error) {
      console.error('Error creating recommendation:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  // PUT - Update an existing recommendation
  else if (req.method === 'PUT') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          message: 'Missing recommendation ID'
        });
      }
      
      // Find recommendation and ensure it belongs to the user
      const recommendation = await Recommendation.findOne({
        _id: id,
        userId: req.user.id
      });
      
      if (!recommendation) {
        return res.status(404).json({
          message: 'Recommendation not found'
        });
      }
      
      // Update fields that are provided
      const updateFields = [
        'title', 'type', 'genre', 'source', 'description',
        'status', 'priority', 'rating', 'notes', 'url',
        'completedAt', 'scheduledFor'
      ];
      
      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          recommendation[field] = req.body[field];
        }
      });
      
      // If type is being updated, validate it
      if (req.body.type) {
        const validTypes = ['movie', 'tvshow', 'book', 'podcast', 'music', 'game', 'other'];
        if (!validTypes.includes(req.body.type)) {
          return res.status(400).json({
            message: 'Invalid type',
            validTypes
          });
        }
      }
      
      // Update modifiedAt timestamp
      recommendation.modifiedAt = new Date();
      
      // Save updated recommendation
      await recommendation.save();
      
      res.status(200).json({
        message: 'Recommendation updated successfully',
        recommendation
      });
    } catch (error) {
      console.error('Error updating recommendation:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  // DELETE - Remove a recommendation
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          message: 'Missing recommendation ID'
        });
      }
      
      // Find recommendation and ensure it belongs to the user
      const recommendation = await Recommendation.findOne({
        _id: id,
        userId: req.user.id
      });
      
      if (!recommendation) {
        return res.status(404).json({
          message: 'Recommendation not found'
        });
      }
      
      // Remove related references in Media if they exist
      if (recommendation.mediaId) {
        await Media.updateOne(
          { _id: recommendation.mediaId },
          { $unset: { recommendationId: "" } }
        );
      }
      
      // Delete the recommendation
      await Recommendation.deleteOne({ _id: id });
      
      res.status(200).json({
        message: 'Recommendation deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      res.status(500).json({ message: error.message });
    }
  }
  
  // Handle unsupported methods
  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }
}

export default withAuth(handler);