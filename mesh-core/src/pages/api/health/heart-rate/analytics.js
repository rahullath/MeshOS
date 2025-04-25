// src/pages/api/health/heart-rate/analytics.js - Heart rate analytics for dashboard
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import HeartRate from '../../../../models/HeartRate';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get parameters
      const { period = '30d' } = req.query;
      
      // Calculate date range based on period
      const endDate = new Date();
      let startDate = new Date();
      
      switch (period) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Base match condition
      const match = {
        userId: req.user.id,
        date: { $gte: startDate, $lte: endDate }
      };
      
      // Get summary statistics
      const heartRateSummary = await HeartRate.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            avgMin: { $avg: "$min" },
            avgMax: { $avg: "$max" },
            avgRange: { $avg: { $subtract: ["$max", "$min"] } },
            lowestMin: { $min: "$min" },
            highestMax: { $max: "$max" },
            totalEntries: { $sum: 1 }
          }
        }
      ]);
      
      // Get day-by-day time series
      const timeSeries = await HeartRate.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            min: { $avg: "$min" },
            max: { $avg: "$max" },
            date: { $first: "$date" }
          }
        },
        { $sort: { date: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            min: 1,
            max: 1,
            range: { $subtract: ["$max", "$min"] }
          }
        }
      ]);
      
      // Calculate resting heart rate trend (using min value as proxy)
      const restingHeartRateTrend = await HeartRate.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              year: { $year: "$date" },
              week: { $week: "$date" }
            },
            avgMin: { $avg: "$min" },
            firstDay: { $min: "$date" }
          }
        },
        { $sort: { firstDay: 1 } },
        {
          $project: {
            _id: 0,
            week: {
              $concat: [
                { $toString: "$_id.year" },
                "-W",
                { $toString: "$_id.week" }
              ]
            },
            restingHeartRate: "$avgMin",
            firstDay: 1
          }
        }
      ]);
      
      // Send combined response
      res.status(200).json({
        summary: heartRateSummary[0] || {
          avgMin: 0,
          avgMax: 0,
          avgRange: 0,
          lowestMin: 0,
          highestMax: 0,
          totalEntries: 0
        },
        timeSeries,
        restingHeartRateTrend,
        dateRange: {
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Error generating heart rate analytics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
