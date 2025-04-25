import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import Habit from '../../../models/Habit';
import HabitEntry from '../../../models/HabitEntry';
import { parse } from 'papaparse';

// Max upload size - adjust as needed
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  try {
    await dbConnect();
    
    // Get CSV content from request body
    const { csvContent } = req.body;
    
    if (!csvContent) {
      return res.status(400).json({ message: 'No CSV content provided' });
    }
    
    // Parse CSV
    const { data, errors } = parse(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: header => header.trim().toLowerCase()
    });
    
    if (errors.length > 0) {
      return res.status(400).json({ message: 'Error parsing CSV', errors });
    }
    
    let imported = 0;
    const results = [];
    
    // Process Loop Habits app format
    for (const row of data) {
      try {
        // Create habit based on Loop Habits CSV format
        // Adjust this based on the actual format of your export
        const habit = new Habit({
          name: row.name || row.habit || '',
          type: row.type === 'negative' || row.type === 'quit' ? 'negative' : 'positive',
          category: row.category || 'general',
          frequency: 'daily', // Default to daily
          notes: row.notes || row.description || ''
        });
        
        const savedHabit = await habit.save();
        
        // Process habit entries if included
        // Format will depend on your export, this is just an example
        if (row.entries) {
          const entries = JSON.parse(row.entries);
          for (const entry of entries) {
            try {
              await new HabitEntry({
                habitId: savedHabit._id,
                date: new Date(entry.date),
                value: entry.value || 1
              }).save();
            } catch (entryError) {
              // Skip duplicate entries
              if (entryError.code !== 11000) {
                console.error('Entry error:', entryError);
              }
            }
          }
        }
        
        imported++;
        results.push(savedHabit);
      } catch (rowError) {
        console.error('Error importing row:', rowError);
      }
    }
    
    res.status(200).json({
      message: `Successfully imported ${imported} habits`,
      imported,
      results
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ message: 'Server error during import', error: error.message });
  }
}
