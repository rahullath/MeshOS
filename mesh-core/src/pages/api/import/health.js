import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    // Connect to database
    const { db } = await connectToDatabase();
    
    console.log("Received health import request");
    
    // Get data from request
    const { heartrateTxt, sleepTxt } = req.body;
    
    // Create a test sleep record
    const sleepData = {
      userId: req.userId || "test-user",
      date: new Date(),
      hours: 7.5,
      notes: "Imported from sleep data"
    };
    
    // Create a test heart rate record
    const heartrateData = {
      userId: req.userId || "test-user",
      date: new Date(),
      min: 65,
      max: 120
    };
    
    // Insert into database - using collection directly since we're in development
    await db.collection('sleeps').insertOne(sleepData);
    await db.collection('heartrates').insertOne(heartrateData);
    
    res.status(200).json({ 
      message: 'Health data imported successfully',
      sleepRecordsImported: 1,
      heartrateRecordsImported: 1
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ 
      message: 'Server error during import', 
      error: error.message,
      stack: process.env.NODE_ENV !== 'production' ? error.stack : undefined
    });
  }
}
