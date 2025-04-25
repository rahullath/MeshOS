import { connectToDatabase, getCollection } from '../../../lib/mongodb';
import HeartRate from '../../../models/HeartRate';
import Sleep from '../../../models/Sleep';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { heartrateTxt, sleepTxt } = req.body;

      // Process heartrate.txt
      const heartrateLines = heartrateTxt.split('\\n').slice(1); // Skip header

      for (const line of heartrateLines) {
        const [date, range] = line.split('\\t');
        if (!date || !range) continue;

        const [min, max] = range.replace(' bpm', '').split(' - ').map(Number);

        const heartRate = new HeartRate({
          date: new Date(date),
          min,
          max
        });

        await heartRate.save();
      }

      // Process sleep.txt
      const sleepLines = sleepTxt.split('\\n').slice(1); // Skip header

      for (const line of sleepLines) {
        const [date, duration] = line.split('\\t');
        if (!date || !duration) continue;

        const [hours, minutes] = duration.replace(' min', '').split(' h ').map(Number);
        const totalHours = hours + (minutes / 60);

        const sleep = new Sleep({
          date: new Date(date),
          hours: totalHours
        });

        await sleep.save();
      }

      res.status(200).json({ message: 'Health data imported successfully' });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
