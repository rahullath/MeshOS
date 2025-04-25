// src/pages/api/finance/crypto/holdings/index.js - CRUD for crypto holdings
import { connectToDatabase, getCollection } from '../../../../../lib/mongodb';
import CryptoHolding from '../../../../../models/CryptoHolding';
import withAuth from '../../../../../middleware/withAuth';

async function handler(req, res) {
  await dbConnect();

  // GET - Fetch all crypto holdings
  if (req.method === 'GET') {
    try {
      const holdings = await CryptoHolding.find({}).sort({ purchaseDate: -1 });
      
      res.status(200).json(holdings);
    } catch (error) {
      console.error('Error fetching crypto holdings:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // POST - Create a new crypto holding
  else if (req.method === 'POST') {
    try {
      // Validate required fields
      const { name, symbol, quantity } = req.body;
      
      if (!name || !symbol || quantity === undefined) {
        return res.status(400).json({
          message: 'Missing required fields',
          required: ['name', 'symbol', 'quantity']
        });
      }
      
      // Validate quantity
      if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ message: 'Quantity must be a valid positive number' });
      }
      
      // Parse purchaseDate if provided
      if (req.body.purchaseDate) {
        try {
          req.body.purchaseDate = new Date(req.body.purchaseDate);
          if (isNaN(req.body.purchaseDate.getTime())) {
            return res.status(400).json({ message: 'Invalid purchaseDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid purchaseDate format' });
        }
      }
      
      // Create and save holding
      const holding = new CryptoHolding({
        ...req.body,
        userId: req.user.id // From auth middleware
      });
      
      const newHolding = await holding.save();
      res.status(201).json(newHolding);
    } catch (error) {
      console.error('Error creating crypto holding:', error);
      res.status(400).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
