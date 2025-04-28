// mesh-core/src/pages/api/import/health.js
// Assuming this route handles importing health data for the authenticated user.
import connectToDatabase from '../../../lib/mongodb';
import withAuth from '../../../middleware/withAuth';
// Assuming relevant models exist, e.g., HealthMetric, Sleep, HeartRate, Medication
import HealthMetric from '../../../models/HealthMetric';
import Sleep from '../../../models/Sleep';
import HeartRate from '../../../models/HeartRate';
import Medication from '../../../models/Medication';

const handler = async (req, res) => {
  await connectToDatabase();
  const userId = req.userId;

  const { heartrateTxt, sleepTxt } = req.body;

  if (!heartrateTxt || !sleepTxt) {
    return res.status(400).json({ success: false, message: 'Both heartrateTxt and sleepTxt are required' });
  }

  try {
    // Parse heartrate data
    const heartrateLines = heartrateTxt.split('\n').filter(line => line.trim());
    const heartrateData = heartrateLines.map(line => {
      const [dateStr, minRate, maxRate] = line.split(',').map(item => item.trim());
      return {
        userId,
        date: new Date(dateStr),
        min: parseInt(minRate),
        max: parseInt(maxRate)
      };
    });

    // Parse sleep data
    const sleepLines = sleepTxt.split('\n').filter(line => line.trim());
    const sleepData = sleepLines.map(line => {
      const [dateStr, hours] = line.split(',').map(item => item.trim());
      return {
        userId,
        date: new Date(dateStr),
        hours: parseFloat(hours)
      };
    });

    // Insert into database
    await HeartRate.insertMany(heartrateData);
    await Sleep.insertMany(sleepData);

    res.status(200).json({ 
      success: true, 
      message: 'Health data imported successfully',
      imported: {
        heartrate: heartrateData.length,
        sleep: sleepData.length
      }
    });
  } catch (error) {
    console.error('Health import error:', error);
    res.status(500).json({ success: false, message: 'Error importing health data', error: error.message });
  }
};

export default withAuth(handler);
