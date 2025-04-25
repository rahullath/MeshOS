import { verifyToken } from '../lib/auth';

const withAuth = (handler) => async (req, res) => {
  try {
    // Check if the cookie exists
    const cookieHeader = req.headers.cookie;
    console.log("Cookie Header:", cookieHeader);
    
    let token = null;
    if (cookieHeader) {
      const authCookie = cookieHeader.split(';').find(c => c.trim().startsWith('auth='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }

    console.log("Extracted Token:", token);
    
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
