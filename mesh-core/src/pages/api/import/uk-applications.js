import dbConnect from '../../../lib/mongodb';
import Application from '../../../models/Application';
import Papa from 'papaparse';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await dbConnect();

      const { applicationsCsv } = req.body;

      // Process applications CSV
      const parsedApplications = Papa.parse(applicationsCsv, { header: true, skipEmptyLines: true });

      if (parsedApplications.errors.length > 0) {
        console.error('Applications CSV parsing errors:', parsedApplications.errors);
        return res.status(400).json({ message: 'Error parsing applications CSV' });
      }

      const applications = parsedApplications.data.map(row => {
        let type = 'other';
        if (row.Category === 'Visa') {
          type = 'visa';
        } else if (row['Application Fees'] || row.Item.toLowerCase().includes('tuition fees')) {
          type = 'university';
        }

        const amountGBP = parseFloat(row['£'] || 0);
        const amountINR = parseFloat(row['₹'] || 0);
        const amountUSD = amountGBP + (amountINR / 83);

        let status = 'preparing';
        if (row['Offer Received'] === 'Not Yet') {
          status = 'preparing';
        } else if (row['Offer Received'] === 'Conditional Offer') {
          status = 'submitted';
        } else if (row['Offer Received'] === 'Rejected') {
          status = 'rejected';
        } else if (row['Offer Received'] === 'Accepted') {
          status = 'accepted';
        }

        return {
          type: type,
          name: row['University/Purpose'] || row.Item,
          organization: row['University/Purpose'],
          status: status,
          priority: 'medium',
          costs: [{
            description: row.Item,
            amount: amountUSD,
            currency: 'USD',
            isPaid: row['Paid?'] === 'TRUE'
          }],
          notes: row.Notes
        };
      });

      await Application.insertMany(applications);

      res.status(200).json({ message: 'UK applications data imported successfully' });
    } catch (error) {
      console.error('Import error:', error);
      res.status(500).json({ message: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
