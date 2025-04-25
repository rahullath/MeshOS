// src/pages/api/content/analytics.js - Content analytics for dashboard
import dbConnect from '../../../lib/mongodb';
import Media from '../../../models/Media';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // 1. Total counts by type
      const typeCounts = await Media.aggregate([
        { $match: { userId: req.user.id } },
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 },
            completed: { 
              $sum: { $cond: [{ $eq: ["$completed", true] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            type: "$_id",
            count: 1,
            completed: 1,
            inProgress: { $subtract: ["$count", "$completed"] }
          }
        }
      ]);
      
      // 2. Top genres
      const topGenres = await Media.aggregate([
        { 
          $match: { 
            userId: req.user.id,
            genre: { $exists: true, $ne: "" }
          } 
        },
        {
          $group: {
            _id: "$genre",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            genre: "$_id",
            count: 1
          }
        }
      ]);
      
      // 3. Top languages
      const topLanguages = await Media.aggregate([
        { 
          $match: { 
            userId: req.user.id,
            language: { $exists: true, $ne: "" }
          } 
        },
        {
          $group: {
            _id: "$language",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $project: {
            _id: 0,
            language: "$_id",
            count: 1
          }
        }
      ]);
      
      // 4. Average ratings by type
      const ratings = await Media.aggregate([
        { 
          $match: { 
            userId: req.user.id,
            rating: { $exists: true, $ne: null }
          } 
        },
        {
          $group: {
            _id: "$type",
            avgRating: { $avg: "$rating" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            type: "$_id",
            avgRating: 1,
            count: 1
          }
        }
      ]);
      
      // 5. Recently added
      const recentlyAdded = await Media.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .limit(5);
      
      // 6. Recently completed
      const recentlyCompleted = await Media.find({ 
        userId: req.user.id,
        completed: true
      })
        .sort({ updatedAt: -1 })
        .limit(5);
      
      // 7. Calculate overall stats
      const totalMedia = await Media.countDocuments({ userId: req.user.id });
      const completedMedia = await Media.countDocuments({ userId: req.user.id, completed: true });
      const ratedMedia = await Media.countDocuments({ 
        userId: req.user.id, 
        rating: { $exists: true, $ne: null } 
      });
      
      const averageRating = await Media.aggregate([
        { 
          $match: { 
            userId: req.user.id,
            rating: { $exists: true, $ne: null }
          } 
        },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" }
          }
        }
      ]);
      
      // Send combined response
      res.status(200).json({
        overview: {
          total: totalMedia,
          completed: completedMedia,
          inProgress: totalMedia - completedMedia,
          ratedCount: ratedMedia,
          averageRating: averageRating[0]?.avgRating || 0
        },
        typeCounts,
        topGenres,
        topLanguages,
        ratings,
        recentlyAdded,
        recentlyCompleted
      });
    } catch (error) {
      console.error('Error generating content analytics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
