import connectToDatabase from 'lib/mongodb';
import withAuth from 'middleware/withAuth';
import mongoose from 'mongoose';

// Define the Application schema here to avoid import issues
const ApplicationSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['job', 'university', 'visa', 'other'], 
    required: true 
  },
  name: { type: String, required: true }, // Job title/University name
  organization: { type: String, required: true }, // Company/Institution
  status: { 
    type: String, 
    enum: ['preparing', 'submitted', 'interviewing', 'accepted', 'rejected', 'withdrawn'], 
    default: 'preparing' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  applicationDate: { type: Date },
  deadlineDate: { type: Date },
  responseDate: { type: Date },
  location: { type: String },
  url: { type: String },
  contactEmail: { type: String },
  contactName: { type: String },
  notes: { type: String },
  costs: [{
    description: { type: String },
    amount: { type: Number },
    currency: { type: String, default: 'USD' },
    isPaid: { type: Boolean, default: false },
    paymentDate: { type: Date }
  }],
  documents: [{
    name: { type: String },
    status: { 
      type: String, 
      enum: ['needed', 'in_progress', 'ready', 'submitted'], 
      default: 'needed' 
    },
    notes: { type: String }
  }]
}, { timestamps: true });

// Create or reuse the model
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

/**
 * Applications API handler
 * @param {object} req - The request object
 * @param {object} res - The response object
 */
const handler = async (req, res) => {
  await connectToDatabase();

  const userId = req.userId; // Extracted from auth middleware

  switch (req.method) {
    case 'GET':
      try {
        const applications = await Application.find({ userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: applications });
      } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ success: false, message: 'Error fetching applications', error: error.message });
      }
      break;
    case 'POST':
      try {
        const application = new Application({ ...req.body, userId });
        const newApplication = await application.save();
        res.status(201).json({ success: true, data: newApplication });
      } catch (error) {
        console.error('Error creating application:', error);
        res.status(400).json({ success: false, message: 'Error creating application', error: error.message });
      }
      break;
    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
      break;
  }
};

export default withAuth(handler);