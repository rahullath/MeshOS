// src/pages/api/finance/subscriptions/index.js - CRUD for subscription tracking
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import Subscription from '../../../../models/Subscription';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all subscriptions
  if (req.method === 'GET') {
    try {
      const query = {};
      
      // Add filters
      if (req.query.category) query.category = req.query.category;
      if (req.query.minAmount) query.amount = { $gte: parseFloat(req.query.minAmount) };
      if (req.query.maxAmount) {
        query.amount = { ...query.amount, $lte: parseFloat(req.query.maxAmount) };
      }
      
      // Upcoming renewals filter
      if (req.query.upcoming === 'true') {
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + parseInt(req.query.days || 30));
        
        query.renewalDate = { $gte: today, $lte: futureDate };
      }

      const subscriptions = await Subscription.find(query).sort({ renewalDate: 1 });
      
      res.status(200).json(subscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new subscription
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { name, amount } = req.body;
      
      if (!name || amount === undefined) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['name', 'amount']
        });
      }
      
      // src/pages/api/finance/subscriptions/index.js - Continuing from previous code
      // Validate amount
      if (typeof amount !== 'number' || isNaN(amount) || amount < 0) {
        return res.status(400).json({ message: 'Amount must be a valid positive number' });
      }
      
      // Parse renewalDate if provided
      if (req.body.renewalDate) {
        try {
          req.body.renewalDate = new Date(req.body.renewalDate);
          if (isNaN(req.body.renewalDate.getTime())) {
            return res.status(400).json({ message: 'Invalid renewalDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid renewalDate format' });
        }
      }
      
      // Create and save subscription
      const subscription = new Subscription({
        ...req.body,
        userId: req.user.id // From auth middleware
      });
      
      const newSubscription = await subscription.save();
      res.status(201).json(newSubscription);
    } catch (error) {
      console.error('Error creating subscription:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
