// jest.setup.js in the root directory
// Increase timeout to avoid issues with MongoDB connections
jest.setTimeout(30000);

// Add global teardown to clean up resources
afterAll(async () => {
  // Allow time for any pending operations to complete
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Force cleanup if needed
  if (global.gc) global.gc();
});
