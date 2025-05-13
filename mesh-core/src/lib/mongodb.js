// mesh-core/src/lib/mongodb.js
import mongoose from 'mongoose';

const MONGODB_DB = process.env.MONGODB_DB || 'mesh-os';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Remove this duplicate initial connection - it's not being assigned to cachedConnection
// and is redundant with the connection in the connectToDatabase function
// const connection = await mongoose.connect(process.env.MONGODB_URI, {
//   dbName: MONGODB_DB,
// });

let cachedConnection = null;

async function connectToDatabase() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    // Removed deprecated options: useNewUrlParser and useUnifiedTopology
    // These are now default behavior in the MongoDB driver
    const connection = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: MONGODB_DB,
    });
    
    cachedConnection = connection;
    console.log(`Connected to MongoDB database: ${connection.connections[0].name}`);
    return connection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw new Error('Failed to connect to MongoDB');
  }
}

export default connectToDatabase;