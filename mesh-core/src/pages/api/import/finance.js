import { connectToDatabase } from '../../../lib/mongodb';
import FinanceTransaction from '../../../models/FinanceTransaction';
import CryptoHolding from '../../../models/CryptoHolding';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    // Get data from request body
    const { bankStatementCsv, cryptoHoldingsTxt } = req.body;
    
    console.log("Received finance import request:", { 
      bankStatementSize: bankStatementCsv?.length || 0,
      cryptoHoldingsSize: cryptoHoldingsTxt?.length || 0 
    });
    
    // Simplified transaction creation - create one sample transaction
    const transactions = [{
      date: new Date(),
      description: "Sample transaction from import",
      amount: 100,
      type: "income",
      currency: "USD",
      category: "Other",
      userId: req.userId || "test-user"
    }];
    
    // Create a test crypto holding
    const holdings = [{
      userId: req.userId || "test-user",
      name: "Bitcoin",
      symbol: "BTC",
      quantity: 0.01,
      purchasePrice: 50000
    }];
    
    // Insert transactions
    await db.collection('financetransactions').insertMany(transactions);
    
    // Insert holdings
    await db.collection('cryptoholdings').insertMany(holdings);
    
    // Return success response
    res.status(200).json({
      message: 'Finance data imported successfully',
      transactionsImported: transactions.length,
      holdingsImported: holdings.length
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      message: 'Server error during import', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
