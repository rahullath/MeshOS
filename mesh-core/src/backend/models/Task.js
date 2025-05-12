// mesh-core/src/backend/models/Task.js
const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, { _id: true });

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['work', 'personal', 'visa', 'health', 'project', 'finance', 'other'],
    default: 'personal'
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: null
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  status: {
    type: String,
    enum: ['todo', 'in-progress', 'completed', 'on-hold', 'cancelled'],
    default: 'todo'
  },
  dueDate: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  subtasks: [subtaskSchema],
  tags: [String],
  attachments: [{
    name: String,
    url: String,
    type: String
  }],
  notes: {
    type: String,
    default: ''
  },
  recurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
      default: null
    },
    interval: {
      type: Number,
      default: 1
    },
    endDate: {
      type: Date,
      default: null
    }
  },
  reminders: [{
    date: Date,
    sent: {
      type: Boolean,
      default: false
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true } 
});

// Virtual for progress calculation (based on subtasks)
taskSchema.virtual('progress').get(function() {
  if (!this.subtasks || this.subtasks.length === 0) {
    return this.status === 'completed' ? 100 : 0;
  }
  
  const completedCount = this.subtasks.filter(subtask => subtask.completed).length;
  return Math.round((completedCount / this.subtasks.length) * 100);
});

// Virtual for days remaining until due date
taskSchema.virtual('daysRemaining').get(function() {
  if (!this.dueDate) return null;
  if (this.status === 'completed') return 0;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(this.dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  if (this.status === 'completed') return false;
  
  return this.daysRemaining < 0;
});

// Middleware to update timestamps
taskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // If status is changing to completed, set completedAt
  if (this.isModified('status') && this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }
  
  // If status is changing from completed, clear completedAt
  if (this.isModified('status') && this.status !== 'completed' && this.completedAt) {
    this.completedAt = null;
  }
  
  next();
});

// Indexes for faster queries
taskSchema.index({ status: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ project: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ "tags": 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;