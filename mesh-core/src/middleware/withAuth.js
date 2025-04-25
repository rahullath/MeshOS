import { verifyToken, getTokenFromHeader } from '../lib/auth';

const withAuth = (handler) => async (req, res) => {
  try {
    // For the personal app with only one user, you could simplify this
    // Since you're the only user, you might want to use a simpler authentication method
    // or even an API key approach instead of JWT
    
    const token = getTokenFromHeader(req);
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }
    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }
    
    // Add user ID to the request object
    req.userId = decoded.userId;
    
    // Proceed to the actual handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default withAuth;
