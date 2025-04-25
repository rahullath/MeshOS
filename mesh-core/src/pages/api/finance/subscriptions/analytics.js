// src/pages/api/finance/subscriptions/analytics.js - Subscription analytics
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import Subscription from '../../../../models/Subscription';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      // Get total monthly and yearly costs
      const subscriptions = await Subscription.find({});
      
      let monthlyTotal = 0;
      let yearlyTotal = 0;
      let categoryCosts = {};
      
      subscriptions.forEach(sub => {
        let monthlyCost = 0;
        
        // Calculate monthly cost based on billing cycle
        if (sub.billingCycle === 'monthly' || !sub.billingCycle) {
          monthlyCost = sub.amount;
        } else if (sub.billingCycle === 'yearly') {
          monthlyCost = sub.amount / 12;
        } else if (sub.billingCycle === 'quarterly') {
          monthlyCost = sub.amount / 3;
        } else if (sub.billingCycle === 'weekly') {
          monthlyCost = sub.amount * 4.33; // Average weeks in a month
        } else if (sub.billingCycle === 'daily') {
          monthlyCost = sub.amount * 30.44; // Average days in a month
        }
        
        monthlyTotal += monthlyCost;
        
        // Add to category
        const category = sub.category || 'Uncategorized';
        categoryCosts[category] = (categoryCosts[category] || 0) + monthlyCost;
      });
      
      // Calculate yearly total
      yearlyTotal = monthlyTotal * 12;
      
      // Convert category costs to an array
      const categoryBreakdown = Object.entries(categoryCosts).map(([category, cost]) => ({
        category,
        monthlyAmount: cost,
        yearlyAmount: cost * 12
      })).sort((a, b) => b.monthlyAmount - a.monthlyAmount);
      
      // Get upcoming renewals in the next 30 days
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setDate(nextMonth.getDate() + 30);
      
      const upcomingRenewals = await Subscription.find({
        renewalDate: { $gte: today, $lte: nextMonth }
      }).sort({ renewalDate: 1 });
      
      res.status(200).json({
        summary: {
          count: subscriptions.length,
          monthlyTotal,
          yearlyTotal,
        },
        categoryBreakdown,
        upcomingRenewals
      });
    } catch (error) {
      console.error('Error generating subscription analytics:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
