import withAuth from '../../../middleware/withAuth';
import { getCollection } from '../../../lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const contentCollection = await getCollection('content');
    
    // Get content analytics
    const totalContent = await contentCollection.countDocuments();
    
    // Get content by type
    const contentByType = await contentCollection.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // Get recently consumed content
    const recentContent = await contentCollection
      .find({ consumed: true })
      .sort({ consumedAt: -1 })
      .limit(5)
      .toArray();
    
    return res.status(200).json({
      success: true,
      data: {
        totalContent,
        contentByType,
        recentContent
      }
    });
  } catch (error) {
    console.error('Content analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default withAuth(handler);
