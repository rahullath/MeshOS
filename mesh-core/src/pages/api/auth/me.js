import withAuth from '../../../middleware/withAuth';

async function handler(req, res) {
  console.log('Executing /api/auth/me');
  try {
    if (req.method !== 'GET') {
      console.log('Method not allowed');
      return res.status(405).json({ message: 'Method not allowed' });
    }

    console.log('User ID from auth middleware:', req.userId);

    if (!req.userId) {
      console.log('No user ID found');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    return res.status(200).json({
      username: req.userId,
      userId: req.userId,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler);