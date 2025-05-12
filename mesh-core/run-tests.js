#!/usr/bin/env node
// run-tests.js

// Set environment variables for testing
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/meshOS_test';
process.env.JWT_SECRET = 'test-secret';

// Run Jest programmatically
const { run } = require('jest');

// Set Jest CLI options
const jestOptions = {
  runInBand: true, // Run tests sequentially
  detectOpenHandles: true, // Detect open handles that may cause test failures
  testEnvironment: 'node',
  verbose: true
};

// Start tests
run(Object.values(jestOptions))
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(e => {
    console.error('Error running tests', e);
    process.exit(1);
  });