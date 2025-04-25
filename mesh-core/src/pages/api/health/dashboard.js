// src/pages/api/health/dashboard.js - Health dashboard overview
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import HeartRate from '../../../models/HeartRate';
import Sleep from '../../../models/Sleep';
import HealthMetric from '../../../models/HealthMetric';
import Medication from '../../../models/Medication';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get recent date range
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30); // Last 30 days
      
      // Base match condition
      const dateMatch = {
        date: { $gte: startDate, $lte: endDate }
      };
      
      // 1. Sleep summary
      const sleepSummary = await Sleep.aggregate([
        { $match: { ...dateMatch, userId: req.user.id } },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$hours" },
            entriesCount: { $sum: 1 },
            latestEntry: { $max: "$date" }
          }
        }
      ]);
      
      // 2. Heart rate summary
      const heartRateSummary = await HeartRate.aggregate([
        { $match: { ...dateMatch, userId: req.user.id } },
        {
          $group: {
            _id: null,
            avgRestingRate: { $avg: "$min" },
            entriesCount: { $sum: 1 },
            latestEntry: { $max: "$date" }
          }
        }
      ]);
      
      // 3. Recent health metrics
      const recentMetrics = await HealthMetric.find({ userId: req.user.id })
        .sort({ date: -1 })
        .limit(1);
      
      // 4. Active medications
      const activeMedications = await Medication.find({
        userId: req.user.id,
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gte: new Date() } }
        ]
      });
      
      // 5. Sleep trend
      const sleepTrend = await Sleep.aggregate([
        { $match: { ...dateMatch, userId: req.user.id } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            hours: { $avg: "$hours" },
            date: { $first: "$date" }
          }
        },
        { $sort: { date: -1 } },
        { $limit: 7 },
        { $sort: { date: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            hours: 1
          }
        }
      ]);
      
      // 6. Heart rate trend
      const heartRateTrend = await HeartRate.aggregate([
        { $match: { ...dateMatch, userId: req.user.id } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            min: { $avg: "$min" },
            max: { $avg: "$max" },
            date: { $first: "$date" }
          }
        },
        { $sort: { date: -1 } },
        { $limit: 7 },
        { $sort: { date: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            resting: "$min",
            max: "$max"
          }
        }
      ]);
      
      // Send combined response
      res.status(200).json({
        sleep: {
          summary: sleepSummary[0] || { avgHours: 0, entriesCount: 0, latestEntry: null },
          trend: sleepTrend
        },
        heartRate: {
          summary: heartRateSummary[0] || { avgRestingRate: 0, entriesCount: 0, latestEntry: null },
          trend: heartRateTrend
        },
        recentMetrics: recentMetrics[0] || null,
        medications: {
          active: activeMedications,
          count: activeMedications.length
        }
      });
    } catch (error) {
      console.error('Error generating health dashboard:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
