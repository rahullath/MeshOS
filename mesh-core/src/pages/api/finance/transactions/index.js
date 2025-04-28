// src/pages/api/finance/transactions/index.js - CRUD operations for financial transactions
import { connectToDatabase, getCollection } from '../../../../lib/mongodb';
import FinanceTransaction from '../../../../models/FinanceTransaction';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all transactions or with filters
  if (req.method === 'GET') {
    try {
      const query = {};

      // Basic filters
      if (req.query.type) query.type = req.query.type;
      if (req.query.category) query.category = req.query.category;
      if (req.query.currency) query.currency = req.query.currency;

      // Amount range filter
      if (req.query.minAmount || req.query.maxAmount) {
        query.amount = {};
        if (req.query.minAmount) query.amount.$gte = parseFloat(req.query.minAmount);
        if (req.query.maxAmount) query.amount.$lte = parseFloat(req.query.maxAmount);
      }

      // Date range filter
      if (req.query.startDate || req.query.endDate) {
        query.date = {};
        if (req.query.startDate) query.date.$gte = new Date(req.query.startDate);
        if (req.query.endDate) query.date.$lte = new Date(req.query.endDate);
      }

      // Description search
      if (req.query.search) {
        query.description = { $regex: req.query.search, $options: 'i' };
      }

      // Pagination
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      // Sorting
      const sort = {};
      if (req.query.sort) {
        const [field, order] = req.query.sort.split(':');
        sort[field] = order === 'desc' ? -1 : 1;
      } else {
        sort.date = -1; // Default: newest first
      }

      // Execute query
      const transactions = await FinanceTransaction.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit) || [];

      // Get total count for pagination
      const total = await FinanceTransaction.countDocuments(query) || 0;

      res.status(200).json({
        transactions,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new transaction
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { date, description, amount, type } = req.body;

      if (!date || !description || amount === undefined || !type) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['date', 'description', 'amount', 'type']
        });
      }

      // Validate type enum
      if (!['income', 'expense'].includes(type)) {
        return res.status(400).json({
          message: 'Invalid transaction type',
          allowed: ['income', 'expense']
        });
      }

      // Validate amount
      if (typeof amount !== 'number' || isNaN(amount)) {
        return res.status(400).json({ message: 'Amount must be a valid number' });
      }

      // Parse date
      let parsedDate;
      try {
        parsedDate = new Date(date);
        if (isNaN(parsedDate.getTime())) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      } catch (err) {
        return res.status(400).json({ message: 'Invalid date format' });
      }

      // Create and save transaction
      const transaction = new FinanceTransaction({
        ...req.body,
        date: parsedDate,
        userId: req.user.id // From auth middleware
      });

      const newTransaction = await transaction.save();
      res.status(201).json(newTransaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
