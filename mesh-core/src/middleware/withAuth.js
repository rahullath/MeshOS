import { authenticateToken } from '../../lib/auth';

export default function withAuth(handler) {
  return async (req, res) => {
    const { authenticated, user } = authenticateToken(req);

    if (!authenticated) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Add user to request object
    req.user = user;
    
    // Proceed to the API endpoint
    return handler(req, res);
  };
}
