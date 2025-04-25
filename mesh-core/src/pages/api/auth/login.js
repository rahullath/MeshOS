import jwt from 'jsonwebtoken';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  // Simple authentication since this is a personal app
  if (
    username === process.env.AUTH_USER &&
    password === process.env.AUTH_PASSWORD
  ) {
    // Generate JWT token that expires in 7 days
    const token = jwt.sign(
      { username, authorized: true },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log("Token to set as cookie:", token);


    // Set HTTP-only cookie with the token
    res.setHeader(
      'Set-Cookie',
      `auth=${token}; Path=/; HttpOnly; Max-Age=${7 * 24 * 60 * 60}; SameSite=Strict; ${
        process.env.NODE_ENV === 'production' ? 'Secure' : ''
      }`
    );

    return res.status(200).json({ success: true });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
}
