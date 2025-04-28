/**
 * Seed script to populate the database with test data
 * Run with: node seed-data.js
 */
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mesh-os';

// Define models directly in this script to avoid import issues
const defineModels = () => {
  // Task model
  const TaskSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['todo', 'in_progress', 'blocked', 'done'], default: 'todo' },
    dueDate: { type: Date },
    completedDate: { type: Date },
    project: { type: String },
    tags: [{ type: String }],
    timeEstimate: { type: Number },
    timeSpent: { type: Number, default: 0 },
    notes: { type: String }
  }, { timestamps: true });

  // Habit model
  const HabitSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String, enum: ['positive', 'negative'], required: true },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    color: { type: String, default: '#4287f5' },
    notes: { type: String },
    archived: { type: Boolean, default: false }
  }, { timestamps: true });

  // Project model
  const ProjectSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    status: { type: String, enum: ['planning', 'active', 'on_hold', 'completed', 'abandoned'], default: 'planning' },
    startDate: { type: Date },
    targetEndDate: { type: Date },
    actualEndDate: { type: Date },
    notes: { type: String },
    tags: [{ type: String }]
  }, { timestamps: true });

  // Finance Transaction model
  const FinanceTransactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    description: { type: String, required: true },
    category: { type: String },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['income', 'expense'], required: true },
    notes: { type: String }
  }, { timestamps: true });

  // Crypto Holding model
  const CryptoHoldingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    symbol: { type: String, required: true },
    quantity: { type: Number, required: true },
    purchaseDate: { type: Date },
    purchasePrice: { type: Number },
    notes: { type: String }
  }, { timestamps: true });

  // Health models
  const HeartRateSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    min: { type: Number },
    max: { type: Number }
  }, { timestamps: true });

  const SleepSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    hours: { type: Number },
    notes: { type: String }
  }, { timestamps: true });

  // Create and return models
  return {
    Task: mongoose.models.Task || mongoose.model('Task', TaskSchema),
    Habit: mongoose.models.Habit || mongoose.model('Habit', HabitSchema),
    Project: mongoose.models.Project || mongoose.model('Project', ProjectSchema),
    FinanceTransaction: mongoose.models.FinanceTransaction || mongoose.model('FinanceTransaction', FinanceTransactionSchema),
    CryptoHolding: mongoose.models.CryptoHolding || mongoose.model('CryptoHolding', CryptoHoldingSchema),
    HeartRate: mongoose.models.HeartRate || mongoose.model('HeartRate', HeartRateSchema),
    Sleep: mongoose.models.Sleep || mongoose.model('Sleep', SleepSchema)
  };
};

// Sample data
const generateSampleData = (userId = 'ketamine') => {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return {
    tasks: [
      {
        userId,
        title: 'Complete MeshOS MVP',
        description: 'Finish the minimum viable product for MeshOS dashboard',
        category: 'project',
        priority: 'high',
        status: 'in_progress',
        dueDate: nextWeek,
        project: 'MeshOS',
        tags: ['development', 'nextjs', 'react']
      },
      {
        userId,
        title: 'Apply for frontend developer job',
        description: 'Submit application for the senior frontend role',
        category: 'job_application',
        priority: 'high',
        status: 'todo',
        dueDate: nextWeek,
        tags: ['career', 'job-hunt']
      },
      {
        userId,
        title: 'Buy cat food',
        description: 'Get Royal Canin for Marshall',
        category: 'cat',
        priority: 'medium',
        status: 'todo',
        dueDate: tomorrow
      }
    ],
    habits: [
      {
        userId,
        name: 'Morning Exercise',
        category: 'health',
        type: 'positive',
        frequency: 'daily',
        color: '#4CAF50'
      },
      {
        userId,
        name: 'Meditation',
        category: 'mental',
        type: 'positive',
        frequency: 'daily',
        color: '#9C27B0'
      },
      {
        userId,
        name: 'No Social Media',
        category: 'productivity',
        type: 'negative',
        frequency: 'daily',
        color: '#F44336'
      }
    ],
    projects: [
      {
        userId,
        name: 'MeshOS Development',
        description: 'Personal dashboard for life management',
        category: 'Software',
        status: 'active',
        startDate: lastWeek,
        targetEndDate: nextWeek,
        tags: ['nextjs', 'mongodb']
      },
      {
        userId,
        name: 'Job Search',
        description: 'Find a new developer position',
        category: 'Career',
        status: 'active',
        startDate: yesterday,
        tags: ['career', 'networking']
      }
    ],
    financeTransactions: [
      {
        userId,
        date: yesterday,
        description: 'Salary',
        category: 'Income',
        amount: 5000.00,
        type: 'income',
        notes: 'Monthly salary'
      },
      {
        userId,
        date: now,
        description: 'Grocery Shopping',
        category: 'Food',
        amount: -120.50,
        type: 'expense',
        notes: 'Weekly groceries'
      },
      {
        userId,
        date: now,
        description: 'Spotify Subscription',
        category: 'Entertainment',
        amount: -9.99,
        type: 'expense'
      }
    ],
    cryptoHoldings: [
      {
        userId,
        name: 'Bitcoin',
        symbol: 'BTC',
        quantity: 0.25,
        purchaseDate: lastWeek,
        purchasePrice: 50000
      },
      {
        userId,
        name: 'Ethereum',
        symbol: 'ETH',
        quantity: 2.5,
        purchaseDate: lastWeek,
        purchasePrice: 3000
      }
    ],
    heartRates: [
      {
        userId,
        date: yesterday,
        min: 55,
        max: 120
      },
      {
        userId,
        date: now,
        min: 58,
        max: 125
      }
    ],
    sleep: [
      {
        userId,
        date: yesterday,
        hours: 7.5,
        notes: 'Slept well'
      },
      {
        userId,
        date: now,
        hours: 6.5,
        notes: 'Woke up a few times'
      }
    ]
  };
};

// Seed database function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Define models
    const models = defineModels();

    // Generate test data
    const userId = 'ketamine'; // Use the hardcoded user ID from withAuth middleware
    const testData = generateSampleData(userId);

    // Insert data for each model
    console.log('Seeding tasks...');
    await models.Task.insertMany(testData.tasks);

    console.log('Seeding habits...');
    await models.Habit.insertMany(testData.habits);

    console.log('Seeding projects...');
    await models.Project.insertMany(testData.projects);

    console.log('Seeding finance transactions...');
    await models.FinanceTransaction.insertMany(testData.financeTransactions);

    console.log('Seeding crypto holdings...');
    await models.CryptoHolding.insertMany(testData.cryptoHoldings);

    console.log('Seeding heart rate data...');
    await models.HeartRate.insertMany(testData.heartRates);

    console.log('Seeding sleep data...');
    await models.Sleep.insertMany(testData.sleep);

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
  }
};

// Run the seeding function
seedDatabase();
