// src/pages/api/health/sleep/analytics.js - Sleep analytics for dashboard
import dbConnect from '../../../../lib/mongodb';
import Sleep from '../../../../models/Sleep';
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

      // src/pages/api/health/sleep/analytics.js - Continuing from previous code
      
      // Get summary statistics
      const sleepSummary = await Sleep.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$hours" },
            minHours: { $min: "$hours" },
            maxHours: { $max: "$hours" },
            totalEntries: { $sum: 1 },
            totalSleepHours: { $sum: "$hours" }
          }
        }
      ]);
      
      // Get day-by-day time series
      const timeSeries = await Sleep.aggregate([
        { $match: match },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            hours: { $avg: "$hours" },
            date: { $first: "$date" }
          }
        },
        { $sort: { date: 1 } },
        {
          $project: {
            _id: 0,
            date: "$_id",
            hours: 1
          }
        }
      ]);
      
      // Get weekly averages
      const weeklyAverages = await Sleep.aggregate([
        { $match: match },
        {
          $group: {
            _id: { 
              year: { $year: "$date" },
              week: { $week: "$date" }
            },
            avgHours: { $avg: "$hours" },
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
            avgHours: 1,
            firstDay: 1
          }
        }
      ]);
      
      // Calculate sleep quality metrics
      // Assuming 7-9 hours is ideal for adults
      const idealSleepMin = 7;
      const idealSleepMax = 9;
      
      const qualityData = timeSeries.map(day => {
        let quality = "unknown";
        
        if (day.hours < 6) {
          quality = "poor";
        } else if (day.hours >= 6 && day.hours < idealSleepMin) {
          quality = "fair";
        } else if (day.hours >= idealSleepMin && day.hours <= idealSleepMax) {
          quality = "good";
        } else if (day.hours > idealSleepMax) {
          quality = "oversleeping";
        }
        
        return {
          ...day,
          quality
        };
      });
      
      // Count days by quality
      const qualityCounts = {
        poor: qualityData.filter(d => d.quality === "poor").length,
        fair: qualityData.filter(d => d.quality === "fair").length,
        good: qualityData.filter(d => d.quality === "good").length,
        oversleeping: qualityData.filter(d => d.quality === "oversleeping").length
      };
      
      // Send combined response
      res.status(200).json({
        summary: sleepSummary[0] || {
          avgHours: 0,
          minHours: 0,
          maxHours: 0,
          totalEntries: 0,
          totalSleepHours: 0
        },
        timeSeries,
        weeklyAverages,
        qualityCounts,
        dateRange: {
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Error generating sleep analytics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
