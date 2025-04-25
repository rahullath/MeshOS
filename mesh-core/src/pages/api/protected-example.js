import withAuth from '../../middleware/withAuth'; // Import the authentication middleware
import { connectToDatabase } from '../../lib/mongodb'; // Import the database connection utility

async function handler(req, res) {
  // This will only execute if the user is authenticated by the withAuth middleware
  try {
    // Establish a connection to the MongoDB database
    const { db } = await connectToDatabase();

    // Access the 'testCollection' collection (or create it if it doesn't exist)
    const collection = db.collection('testCollection');

    // Find all documents in the collection
    const data = await collection.find({}).toArray();

    // Return the data in the response
    res.status(200).json({
      message: 'This is a protected endpoint',
      user: req.userId, // Show the user ID from the auth middleware
      data: data // Send the fetched data
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ message: 'Internal server error' }); // Handle errors gracefully
  }
}

export default withAuth(handler); // Wrap the handler with the authentication middleware

