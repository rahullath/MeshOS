// src/pages/api/content/media/[id].js - CRUD for a specific media entry
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import Media from '../../../../models/Media';
import withAuth from '@/middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Media ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific media entry
  if (req.method === 'GET') {
    try {
      const media = await Media.findById(id);
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      res.status(200).json(media);
    } catch (error) {
      console.error('Error fetching media:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a media entry
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
      
      // Validate rating if provided
      if (updates.rating !== undefined) {
        const rating = parseInt(updates.rating);
        if (isNaN(rating) || rating < 1 || rating > 5) {
          return res.status(400).json({ message: 'Rating must be a number between 1 and 5' });
        }
        updates.rating = rating;
      }
      
      const media = await Media.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      res.status(200).json(media);
    } catch (error) {
      console.error('Error updating media:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a media entry
  else if (req.method === 'DELETE') {
    try {
      const media = await Media.findByIdAndDelete(id);
      
      if (!media) {
        return res.status(404).json({ message: 'Media not found' });
      }
      
      res.status(200).json({ message: 'Media deleted successfully' });
    } catch (error) {
      console.error('Error deleting media:', error);
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
