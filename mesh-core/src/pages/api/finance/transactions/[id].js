// src/pages/api/finance/transactions/[id].js - CRUD for a specific transaction
import dbConnect from '../../../../lib/mongodb';
import FinanceTransaction from '../../../../models/FinanceTransaction';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Transaction ID is required' });
  }

  await dbConnect();

  // GET - Fetch a specific transaction
  if (req.method === 'GET') {
    try {
      const transaction = await FinanceTransaction.findById(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(200).json(transaction);
    } catch (error) {
      console.error('Error fetching transaction:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a transaction
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate type enum if provided
      if (updates.type && !['income', 'expense'].includes(updates.type)) {
        return res.status(400).json({
          message: 'Invalid transaction type',
          allowed: ['income', 'expense']
        });
      }
      
      // Validate amount if provided
      if (updates.amount !== undefined && (typeof updates.amount !== 'number' || isNaN(updates.amount))) {
        return res.status(400).json({ message: 'Amount must be a valid number' });
      }
      
      // Parse date if provided
      if (updates.date) {
        try {
          updates.date = new Date(updates.date);
          if (isNaN(updates.date.getTime())) {
            return res.status(400).json({ message: 'Invalid date format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid date format' });
        }
      }
      
      const transaction = await FinanceTransaction.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(200).json(transaction);
    } catch (error) {
      console.error('Error updating transaction:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a transaction
  else if (req.method === 'DELETE') {
    try {
      const transaction = await FinanceTransaction.findByIdAndDelete(id);
      
      if (!transaction) {
        return res.status(404).json({ message: 'Transaction not found' });
      }
      
      res.status(200).json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Error deleting transaction:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // Not allowed
  else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

export default withAuth(handler);
