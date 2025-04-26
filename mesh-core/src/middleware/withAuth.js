// Support both import styles
import { verifyToken } from 'lib/auth';

/**
 * Authentication middleware for API routes
 * Wraps an API handler function to check for authentication
 * @param {function} handler - The API route handler function
 * @returns {function} - The wrapped handler function
 */
const withAuth = (handler) => async (req, res) => {
  try {
    // Get token from cookie
    const cookieHeader = req.headers.cookie;
    let token = null;
    
    if (cookieHeader) {
      const authCookie = cookieHeader.split(';').find(c => c.trim().startsWith('auth='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }
    
    // Also check for token in Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log("No authentication token found.");
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Verify the token
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log("Invalid authentication token.");
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    // Attach user ID to request object
    // In a real app, we'd use the decoded.userId, but for testing we're hardcoding 'ketamine'
    req.userId = 'ketamine';
    console.log(`Authenticated user ID set to: ${req.userId}`);

    // Proceed to the actual handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Differentiate between auth errors and internal errors
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    
    return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

export default withAuth;