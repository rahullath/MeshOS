import mongoose from 'mongoose';

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

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
