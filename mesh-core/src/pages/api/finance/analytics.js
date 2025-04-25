// src/pages/api/finance/analytics.js - Financial analytics for dashboard
import dbConnect from '../../../../lib/mongodb';
import FinanceTransaction from '../../../../models/FinanceTransaction';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get parameters
      const { period = '30d', currency = 'USD' } = req.query;
      
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
        case 'ytd':
          startDate = new Date(endDate.getFullYear(), 0, 1); // Jan 1 of current year
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }
      
      // Base match condition
      const match = {
        date: { $gte: startDate, $lte: endDate }
      };
      
      // Add currency filter if specified
      if (currency !== 'all') {
        match.currency = currency;
      }
      
      // 1. Overall summary
      const overallSummary = await FinanceTransaction.aggregate([
        { $match: match },
        { 
          $group: {
            _id: null,
            totalIncome: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
            },
            totalExpenses: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
            },
            transactionCount: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            totalIncome: 1,
            totalExpenses: 1,
            netIncome: { $subtract: ["$totalIncome", "$totalExpenses"] },
            savingsRate: {
              $cond: [
                { $eq: ["$totalIncome", 0] },
                0,
                { $multiply: [{ $divide: [{ $subtract: ["$totalIncome", "$totalExpenses"] }, "$totalIncome"] }, 100] }
              ]
            },
            transactionCount: 1
          }
        }
      ]);

      // 2. Category breakdown for expenses
      const categoryBreakdown = await FinanceTransaction.aggregate([
        { 
          $match: { 
            ...match,
            type: "expense"
          } 
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            category: { $ifNull: ["$_id", "Uncategorized"] },
            total: 1,
            count: 1
          }
        },
        { $sort: { total: -1 } }
      ]);

      // 3. Monthly/weekly summary
      let timeGrouping = {};
      let timeFormat = "";
      
      if (period === '1y' || period === 'ytd') {
        // Group by month for longer periods
        timeGrouping = {
          year: { $year: "$date" },
          month: { $month: "$date" }
        };
        timeFormat = "month";
      } else {
        // Group by day for shorter periods
        timeGrouping = {
          year: { $year: "$date" },
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" }
        };
        timeFormat = "day";
      }

      const timeSeries = await FinanceTransaction.aggregate([
        { $match: match },
        {
          $group: {
            _id: timeGrouping,
            income: {
              $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] }
            },
            expenses: {
              $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] }
            },
            net: {
              $sum: { 
                $cond: [
                  { $eq: ["$type", "income"] },
                  "$amount",
                  { $multiply: ["$amount", -1] }
                ]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: { $ifNull: ["$_id.day", 1] }
              }
            },
            income: 1,
            expenses: 1,
            net: 1
          }
        },
        { $sort: { date: 1 } }
      ]);

      // 4. Recent transactions
      const recentTransactions = await FinanceTransaction.find(match)
        .sort({ date: -1 })
        .limit(5);

      // Send combined response
      res.status(200).json({
        summary: overallSummary[0] || {
          totalIncome: 0,
          totalExpenses: 0,
          netIncome: 0,
          savingsRate: 0,
          transactionCount: 0
        },
        categoryBreakdown,
        timeSeries,
        timeFormat,
        recentTransactions,
        dateRange: {
          startDate,
          endDate
        }
      });
    } catch (error) {
      console.error('Error generating finance analytics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
