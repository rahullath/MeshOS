import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meshOS';
const MONGODB_DB = process.env.MONGODB_DB || 'meshOS';

// Check if we're in a production environment
const isProd = process.env.NODE_ENV === 'production';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  // If we have the cached connection, use that
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Otherwise connect and cache the connection
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable');
  }

  const client = new MongoClient(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  await client.connect();
  const db = client.db(MONGODB_DB);

  // Cache the client and db connection if in production
  if (isProd) {
    cachedClient = client;
    cachedDb = db;
  }

  return { client, db };
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}
