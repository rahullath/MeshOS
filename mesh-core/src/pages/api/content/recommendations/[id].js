// src/pages/api/content/recommendations/[id].js - CRUD for a specific recommendation
import dbConnect from '../../../../lib/mongodb';
import Recommendation from '../../../../models/Recommendation';
import Media from '../../../../models/Media';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Recommendation ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific recommendation
  if (req.method === 'GET') {
    try {
      const recommendation = await Recommendation.findById(id);
      
      if (!recommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }
      
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error fetching recommendation:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a recommendation
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate type enum if provided
      if (updates.type) {
        const validTypes = ['movie', 'tvshow', 'book', 'podcast'];
        if (!validTypes.includes(updates.type)) {
          return res.status(400).json({
            message: 'Invalid media type',
            allowed: validTypes
          });
        }
      }
      
      // Validate source enum if provided
      if (updates.source && !['gemini', 'manual'].includes(updates.source)) {
        return res.status(400).json({
          message: 'Invalid recommendation source',
          allowed: ['gemini', 'manual']
        });
      }
      
      const recommendation = await Recommendation.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!recommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }
      
      res.status(200).json(recommendation);
    } catch (error) {
      console.error('Error updating recommendation:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a recommendation
  else if (req.method === 'DELETE') {
    try {
      const recommendation = await Recommendation.findByIdAndDelete(id);
      
      if (!recommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }
      
      res.status(200).json({ message: 'Recommendation deleted successfully' });
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Convert recommendation to watched media
  else if (req.method === 'POST' && req.query.action === 'watch') {
    try {
      // Get the recommendation
      const recommendation = await Recommendation.findById(id);
      
      if (!recommendation) {
        return res.status(404).json({ message: 'Recommendation not found' });
      }
      
      // Create a new media entry from the recommendation
      const media = new Media({
        userId: req.user.id,
        type: recommendation.type,
        title: recommendation.title,
        genre: recommendation.genre,
        language: recommendation.language,
        director: recommendation.director,
        author: recommendation.author,
        completed: req.body.completed || false,
        rating: req.body.rating,
        notes: `Originally recommended: ${recommendation.reason || 'No reason specified'}`
      });
      
      const newMedia = await media.save();
      
      // Optionally delete the recommendation
      if (req.body.deleteRecommendation) {
        await Recommendation.findByIdAndDelete(id);
      }
      
      res.status(201).json({
        media: newMedia,
        recommendationDeleted: !!req.body.deleteRecommendation
      });
    } catch (error) {
      console.error('Error converting recommendation to watched:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
