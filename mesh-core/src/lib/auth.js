import jwt from 'jsonwebtoken';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

const JWT_SECRET = process.env.JWT_SECRET;

export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token) => {
  console.log("Token to verify:", token);
  console.log("JWT_SECRET:", JWT_SECRET);
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("JWT Verification Error:", error);
    return null;
  }
};

export const getTokenFromHeader = (req) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

export const getUserFromToken = (req) => {
  const token = getTokenFromHeader(req);
  if (!token) return null;
  
  const decoded = verifyToken(token);
  return decoded?.userId || null;
};
