// src/__tests__/helpers/db.js
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// This will create an in-memory MongoDB server for testing
let mongoServer = null;

// Connect to the in-memory database
const connect = async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

// Disconnect from and stop the database
const closeDatabase = async () => {
  try {
    // First try to drop the database if connection is still active
    try {
      await mongoose.connection.dropDatabase();
    } catch (dropError) {
      // Ignore drop errors, continue to connection closing
      console.warn('Warning: Could not drop database, continuing cleanup');
    }
    
    // Force close any remaining connections
    for (const connection of mongoose.connections) {
      try {
        await connection.close(true); // Force close
      } catch (err) {
        // Ignore individual connection close errors
      }
    }
    
    // Stop MongoDB server if available
    if (mongoServer && typeof mongoServer.stop === 'function') {
      await mongoServer.stop();
    }
  } catch (err) {
    console.error('Error closing database connection:', err);
  }
};

// Clear all data in the database
const clearDatabase = async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
};

// Export the helper functions
const dbHelpers = {
  connect,
  closeDatabase,
  clearDatabase,
};

module.exports = dbHelpers;

// Add tests for the helper functions
describe('Database helpers', () => {
  beforeAll(async () => {
    jest.spyOn(mongoose, 'connect').mockResolvedValue();
    jest.spyOn(mongoose.connection, 'dropDatabase').mockResolvedValue();
    jest.spyOn(mongoose.connection, 'close').mockResolvedValue();
    
    // Mock MongoMemoryServer
    MongoMemoryServer.create = jest.fn().mockResolvedValue({
      getUri: jest.fn().mockReturnValue('mock-uri'),
      stop: jest.fn().mockResolvedValue()
    });
    
    // Mock collections for clearDatabase
    mongoose.connection.collections = {
      testCollection: {
        deleteMany: jest.fn().mockResolvedValue({})
      }
    };
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  test('connect should initialize MongoDB server and connect mongoose', async () => {
    await connect();
    
    expect(MongoMemoryServer.create).toHaveBeenCalled();
    expect(mongoose.connect).toHaveBeenCalledWith('mock-uri', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  test('closeDatabase should drop the database and close connections', async () => {
    await closeDatabase();
    
    expect(mongoose.connection.dropDatabase).toHaveBeenCalled();
    expect(mongoose.connection.close).toHaveBeenCalled();
    expect(mongoServer.stop).toHaveBeenCalled();
  });

  test('clearDatabase should delete all documents from all collections', async () => {
    await clearDatabase();
    
    expect(mongoose.connection.collections.testCollection.deleteMany).toHaveBeenCalledWith({});
  });
});
