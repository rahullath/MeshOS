// src/pages/api/finance/subscriptions/[id].js - CRUD for a specific subscription
import dbConnect from '../../../../lib/mongodb';
import Subscription from '../../../../models/Subscription';
import withAuth from '../../../../middleware/withAuth';

async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Subscription ID is required' });
  }
  
  await dbConnect();
  
  // GET - Fetch a specific subscription
  if (req.method === 'GET') {
    try {
      const subscription = await Subscription.findById(id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error('Error fetching subscription:', error);
      res.status(500).json({ message: error.message });
    }
  }
  // PUT - Update a subscription
  else if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      // Validate amount if provided
      if (updates.amount !== undefined && (typeof updates.amount !== 'number' || isNaN(updates.amount) || updates.amount < 0)) {
        return res.status(400).json({ message: 'Amount must be a valid positive number' });
      }
      
      // Parse renewalDate if provided
      if (updates.renewalDate) {
        try {
          updates.renewalDate = new Date(updates.renewalDate);
          if (isNaN(updates.renewalDate.getTime())) {
            return res.status(400).json({ message: 'Invalid renewalDate format' });
          }
        } catch (err) {
          return res.status(400).json({ message: 'Invalid renewalDate format' });
        }
      }
      
      const subscription = await Subscription.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      res.status(200).json(subscription);
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(400).json({ message: error.message });
    }
  }
  // DELETE - Delete a subscription
  else if (req.method === 'DELETE') {
    try {
      const subscription = await Subscription.findByIdAndDelete(id);
      
      if (!subscription) {
        return res.status(404).json({ message: 'Subscription not found' });
      }
      
      res.status(200).json({ message: 'Subscription deleted successfully' });
    } catch (error) {
      console.error('Error deleting subscription:', error);
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
