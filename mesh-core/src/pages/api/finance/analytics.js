import withAuth from '../../../middleware/withAuth';
import { getCollection } from '../../../lib/mongodb';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const transactionsCollection = await getCollection('transactions');
    const subscriptionsCollection = await getCollection('subscriptions');
    const cryptoCollection = await getCollection('crypto');
    
    // Get financial summary
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Monthly expenses
    const monthlyExpenses = await transactionsCollection.aggregate([
      { 
        $match: { 
          type: 'expense', 
          date: { $gte: firstDayOfMonth } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]).toArray();
    
    // Monthly income
    const monthlyIncome = await transactionsCollection.aggregate([
      { 
        $match: { 
          type: 'income', 
          date: { $gte: firstDayOfMonth } 
        } 
      },
      { 
        $group: { 
          _id: null, 
          total: { $sum: '$amount' } 
        } 
      }
    ]).toArray();
    
    // Expenses by category
    const expensesByCategory = await transactionsCollection.aggregate([
      { 
        $match: { 
          type: 'expense', 
          date: { $gte: firstDayOfMonth } 
        } 
      },
      { 
        $group: { 
          _id: '$category', 
          total: { $sum: '$amount' } 
        } 
      }
    ]).toArray();
    
    // Active subscriptions
    const activeSubscriptions = await subscriptionsCollection.find({
      endDate: { $gt: now }
    }).toArray();
    
    // Crypto portfolio value
    const cryptoPortfolio = await cryptoCollection.find().toArray();
    
    return res.status(200).json({
      success: true,
      data: {
        monthlyExpenses: monthlyExpenses[0]?.total || 0,
        monthlyIncome: monthlyIncome[0]?.total || 0,
        expensesByCategory,
        activeSubscriptions,
        cryptoPortfolio
      }
    });
  } catch (error) {
    console.error('Finance analytics error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export default withAuth(handler);
