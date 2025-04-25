import withAuth from '../../../middleware/withAuth';
import { getCollection } from '../../../lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const contentCollection = await getCollection('content');
    
    // Get user's content history
    const consumedContent = await contentCollection
      .find({ consumed: true })
      .sort({ consumedAt: -1 })
      .toArray();
    
    // This is a simple recommendation algorithm
    // In a real implementation, you might want to use more sophisticated 
    // recommendation algorithms based on your preferences
    
    // Extract genres, creators, etc. from consumed content
    const genres = new Set();
    const creators = new Set();
    
    consumedContent.forEach(item => {
      if (item.genres) {
        item.genres.forEach(genre => genres.add(genre));
      }
      if (item.creator) {
        creators.add(item.creator);
      }
    });
    
    // Find recommended content based on genres and creators
    const recommendedContent = await contentCollection
      .find({
        consumed: { $ne: true },
        $or: [
          { genres: { $in: Array.from(genres) } },
          { creator: { $in: Array.from(creators) } }
        ]
      })
      .limit(10)
      .toArray();
    
    return res.status(200).json({
      success: true,
      data: recommendedContent
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default withAuth(handler);
