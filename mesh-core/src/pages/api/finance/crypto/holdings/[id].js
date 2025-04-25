// src/pages/api/finance/crypto/holdings/[id].js - CRUD for a specific crypto holding
import dbConnect from '../../../../../lib/mongodb';
import CryptoHolding from '../../../../../models/CryptoHolding';
import withAuth from '../../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Holding ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific holding
  if (req.method === 'GET') {
    try {
      const holding = await CryptoHolding.findById(id);
      
      if (!holding) {
        return res.status(404).json({ message: 'Crypto holding not found' });
      }
      
      res.status(200).json(holding);
    } catch (error) {
      console.error('Error fetching crypto holding:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a holding
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate quantity if provided
      if (updates.quantity !== undefined && (typeof updates.quantity !== 'number' || isNaN(updates.quantity) || updates.quantity <= 0)) {
        return res.status(400).json({ message: 'Quantity must be a valid positive number' });
      }
      
      // Parse purchaseDate if provided
      if (updates.purchaseDate) {
        try {
          updates.purchaseDate = new Date(updates.purchaseDate);
          if (isNaN(updates.purchaseDate.getTime())) {
            return res.status(400).json({ message: 'Invalid purchaseDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid purchaseDate format' });
        }
      }
      
      const holding = await CryptoHolding.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!holding) {
        return res.status(404).json({ message: 'Crypto holding not found' });
      }
      
      res.status(200).json(holding);
    } catch (error) {
      console.error('Error updating crypto holding:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a holding
  else if (req.method === 'DELETE') {
    try {
      const holding = await CryptoHolding.findByIdAndDelete(id);
      
      if (!holding) {
        return res.status(404).json({ message: 'Crypto holding not found' });
      }
      
      res.status(200).json({ message: 'Crypto holding deleted successfully' });
    } catch (error) {
      console.error('Error deleting crypto holding:', error);
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
