import jwt from 'jsonwebtoken';

// Use a fallback secret for development if environment variable is not defined
const JWT_SECRET = process.env.JWT_SECRET || 'mesh-os-development-secret';

if (!JWT_SECRET) {
  console.warn('JWT_SECRET not defined in environment variables, using fallback secret');
}

/**
 * Generates a JWT token for a user
 * @param {object} payload - The data to include in the token
 * @param {string} expiresIn - Token expiration time (default: '7d')
 * @returns {string} - The JWT token
 */
export const generateToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

/**
 * Verifies a JWT token
 * @param {string} token - The token to verify
 * @returns {object|null} - The decoded token payload or null if invalid
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
};

/**
 * Extracts the token from the authorization header
 * @param {object} req - The request object
 * @returns {string|null} - The token or null if not found
 */
export const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  
  // Also check for token in cookies
  if (req.cookies && req.cookies.auth) {
    return req.cookies.auth;
  }
  
  return null;
};

/**
 * Gets the user ID from the token in the request
 * @param {object} req - The request object
 * @returns {string|null} - The user ID or null if not found/invalid
 */
export const getUserFromToken = (req) => {
  const token = getTokenFromHeader(req);
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};