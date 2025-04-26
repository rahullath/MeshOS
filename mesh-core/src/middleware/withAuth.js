// mesh-core/src/middleware/withAuth.js
import { verifyToken } from '../lib/auth'; // Assuming verifyToken exists and works

const withAuth = (handler) => async (req, res) => {
  try {
    // Basic token check (can be cookie, header, etc.)
    // This part assumes token is in a cookie named 'auth' as per original file
    const cookieHeader = req.headers.cookie;
    let token = null;
    if (cookieHeader) {
      const authCookie = cookieHeader.split(';').find(c => c.trim().startsWith('auth='));
      if (authCookie) {
        token = authCookie.split('=')[1];
      }
    }

    if (!token) {
      console.log("No authentication token found.");
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = verifyToken(token); // Verify the token

    if (!decoded) {
      console.log("Invalid authentication token.");
      return res.status(401).json({ success: false, message: 'Invalid authentication token' });
    }

    // *** Enforce userId 'ketamine' as per requirement 3 ***
    // Although the token might contain a different user ID,
    // we are setting it to 'ketamine' to fulfill the specific filtering requirement.
    // If you need to filter by the *actual* authenticated user from the token,
    // change this line to `req.userId = decoded.userId;`
    req.userId = 'ketamine';
    console.log(`Authenticated user ID set to: ${req.userId} (forced 'ketamine')`);

    // Proceed to the actual handler
    return handler(req, res);
  } catch (error) {
    console.error('Auth middleware error:', error);
    // Differentiate between auth errors and internal errors if possible
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
       return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
    return res.status(500).json({ success: false, message: 'Internal server error during authentication' });
  }
};

export default withAuth;
