import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  category: { type: String },
  status: { 
    type: String, 
    enum: ['planning', 'active', 'on_hold', 'completed', 'abandoned'], 
    default: 'planning' 
  },
  startDate: { type: Date },
  targetEndDate: { type: Date },
  actualEndDate: { type: Date },
  notes: { type: String },
  tags: [{ type: String }]
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
