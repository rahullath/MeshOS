import { verifyToken, getTokenFromHeader } from '../lib/auth';

const withAuth = (handler) => async (req, res) => {
  try {
    // Get token from request
    const token = getTokenFromHeader(req);
        
    // Normal authentication flow
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }    
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }
    
    // Add user ID to the request object
    req.userId = decoded.userId || decoded.username;
    
    // Proceed to the actual handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
        
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default withAuth;
