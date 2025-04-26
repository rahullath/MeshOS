import withAuth from 'middleware/withAuth';
import connectToDatabase from 'lib/mongodb';

/**
 * Protected API route example
 * This route is protected by the authentication middleware
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
async function handler(req, res) {
  // This will only execute if the user is authenticated by the withAuth middleware
  try {
    // Establish a connection to the MongoDB database
    const conn = await connectToDatabase();
    
    // We can access database collections through the connection
    // For this example, we'll just return a successful response
    res.status(200).json({
      success: true,
      message: 'This is a protected endpoint',
      user: req.userId, // Show the user ID from the auth middleware
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in protected endpoint:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}

// Wrap the handler with the authentication middleware
export default withAuth(handler);