// src/pages/api/auth/login.js
import connectToDatabase from '../../../lib/mongodb';
import User from '../../../models/User';
import { generateToken } from '../../../lib/auth';

const handler = async (req, res) => {
  await connectToDatabase();

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    // --- Authentication Logic (Placeholder) ---
    // Replace this with your actual user lookup and password verification logic
    // For this example, we'll simulate a successful login for user 'ketamine'
    console.warn("Login endpoint uses simulated authentication for user 'ketamine'. Replace with actual logic.");
    const user = { _id: 'dummy_id_ketamine', username: 'ketamine' }; // Simulate finding the user

    // Generate token and set cookie
    const token = generateToken({ userId: user._id, username: user.username });
    
    // Set the cookie (adjust cookie options as needed)
    res.setHeader('Set-Cookie', `auth=${token}; HttpOnly; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Strict${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`); // 7 days expiry

    res.status(200).json({ success: true, message: 'Logged in successfully' });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error during login', error: error.message });
  }
};

export default handler;