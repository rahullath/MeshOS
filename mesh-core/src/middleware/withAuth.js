import { verifyToken, getTokenFromHeader } from '../lib/auth';

const withAuth = (handler) => async (req, res) => {
  try {
    // Get token from request
    const token = getTokenFromHeader(req);
    
    // TEMPORARY DEV MODE: Allow requests even without authentication
    // for development purposes (remove this in production)
    const devMode = process.env.NODE_ENV !== 'production';
    if (devMode) {
      // Add a dummy user ID for development
      req.userId = 'dev-user-id';
      return handler(req, res);
    }
    
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
    
    // In development mode, continue anyway
    if (process.env.NODE_ENV !== 'production') {
      req.userId = 'dev-user-id';
      return handler(req, res);
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export default withAuth;
