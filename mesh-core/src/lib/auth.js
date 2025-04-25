import { verify } from 'jsonwebtoken';
import { parse } from 'cookie';

export function authenticateToken(req) {
  // Try to get token from cookies first
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  const cookieToken = cookies.auth;
  
  // Then try Authorization header as fallback
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.split(' ')[1];
  
  const token = cookieToken || headerToken;

  if (!token) {
    return { authenticated: false };
  }

  try {
    const user = verify(token, process.env.JWT_SECRET);
    return { authenticated: true, user };
  } catch (err) {
    return { authenticated: false };
  }
}
