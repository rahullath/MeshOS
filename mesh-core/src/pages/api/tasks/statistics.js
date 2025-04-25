// src/pages/api/tasks/statistics.js - For dashboard analytics
import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Task from '../../../models/Task';
import mongoose from 'mongoose';
import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get request parameters
      const { period = '30d', category } = req.query;
      
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
        createdAt: { $gte: startDate, $lte: endDate }
      };
      
      // Add category filter if provided
      if (category) {
        match.category = category;
      }
      
      // Execute aggregation
      const taskStats = await Task.aggregate([
        { $match: match },
        { 
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: { 
              $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
            },
            incompleteTasks: { 
              $sum: { $cond: [{ $ne: ["$status", "done"] }, 1, 0] }
            },
            highPriorityTasks: { 
              $sum: { $cond: [{ $eq: ["$priority", "high"] }, 1, 0] }
            },
            urgentTasks: { 
              $sum: { $cond: [{ $eq: ["$priority", "urgent"] }, 1, 0] }
            },
            overdueTasks: {
              $sum: {
                $cond: [
                  { 
                    $and: [
                      { $lt: ["$dueDate", endDate] },
                      { $ne: ["$status", "done"] }
                    ]
                  },
                  1, 
                  0
                ]
              }
            },
            avgCompletionTimeHours: {
              $avg: {
                $cond: [
                  { 
                    $and: [
                      { $eq: ["$status", "done"] },
                      { $ne: ["$completedDate", null] },
                      { $ne: ["$createdAt", null] }
                    ]
                  },
                  { 
                    $divide: [
                      { $subtract: ["$completedDate", "$createdAt"] },
                      3600000 // Convert ms to hours
                    ]
                  },
                  null
                ]
              }
            }
          }
        },
        // Add category breakdown
        {
          $lookup: {
            from: "tasks",
            pipeline: [
              { $match: match },
              { 
                $group: {
                  _id: "$category",
                  count: { $sum: 1 },
                  completed: { 
                    $sum: { $cond: [{ $eq: ["$status", "done"] }, 1, 0] }
                  }
                }
              }
            ],
            as: "categoryBreakdown"
          }
        },
        // Add status breakdown
        {
          $lookup: {
            from: "tasks",
            pipeline: [
              { $match: match },
              { 
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            as: "statusBreakdown"
          }
        },
        // Add priority breakdown
        {
          $lookup: {
            from: "tasks",
            pipeline: [
              { $match: match },
              { 
                $group: {
                  _id: "$priority",
                  count: { $sum: 1 }
                }
              }
            ],
            as: "priorityBreakdown"
          }
        },
        // Final projection
        {
          $project: {
            _id: 0,
            totalTasks: 1,
            completedTasks: 1,
            incompleteTasks: 1,
            highPriorityTasks: 1,
            urgentTasks: 1,
            overdueTasks: 1,
            completionRate: {
              $cond: [
                { $eq: ["$totalTasks", 0] },
                0,
                { $multiply: [{ $divide: ["$completedTasks", "$totalTasks"] }, 100] }
              ]
            },
            avgCompletionTimeHours: 1,
            categoryBreakdown: 1,
            statusBreakdown: 1,
            priorityBreakdown: 1
          }
        }
      ]);
      
      // Return stats or an empty object if no tasks found
      res.status(200).json(taskStats[0] || {
        totalTasks: 0,
        completedTasks: 0,
        incompleteTasks: 0,
        highPriorityTasks: 0,
        urgentTasks: 0,
        overdueTasks: 0,
        completionRate: 0,
        avgCompletionTimeHours: 0,
        categoryBreakdown: [],
        statusBreakdown: [],
        priorityBreakdown: []
      });
    } catch (error) {
      console.error('Error generating task statistics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
