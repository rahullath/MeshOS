// mesh-core/src/pages/api/auth/me.js
// This route requires authentication, so we apply withAuth.
// It returns the authenticated user's information (derived from req.userId set by withAuth).
import connectToDatabase from '../../../lib/mongodb';
import withAuth from '../../../middleware/withAuth';
// Optional: import User model if you need to fetch full user detailsmport User from '../../../models/User';

const handler = async (req, res) => {
  await connectToDatabase();

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const userId = req.userId; // Extracted from auth middleware (will be 'ketamine')

  try {
    // Since withAuth enforces req.userId = 'ketamine', we can directly return this.
    // If you want to fetch more details from the DB, use the User model:
    // const user = await User.findById(userId).select('-password'); // Exclude password

    // if (!user) {
    //   // This case should ideally not happen if auth is working, but good for safety
    //   return res.status(404).json({ success: false, message: 'User not found' });
    // }

    res.status(200).json({ success: true, data: { userId: userId, message: `Authenticated as user ID: ${userId}` } }); // Returning the forced userId

  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error fetching user', error: error.message });
  }
};

export default withAuth(handler);
