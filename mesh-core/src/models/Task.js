import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { 
    type: String, 
    required: true,
    enum: ['work', 'job_application', 'university', 'project', 'personal', 'cat', 'other']
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  status: { 
    type: String, 
    enum: ['todo', 'in_progress', 'blocked', 'done'], 
    default: 'todo' 
  },
  dueDate: { type: Date },
  completedDate: { type: Date },
  project: { type: String },
  tags: [{ type: String }],
  timeEstimate: { type: Number }, // in minutes
  timeSpent: { type: Number, default: 0 }, // in minutes
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
