// mesh-core/src/backend/models/HealthMetric.js
const mongoose = require('mongoose');

const metricValueSchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
});

const healthMetricSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Metric name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['weight', 'bloodPressure', 'bloodSugar', 'heartRate', 'steps', 'calories', 'water', 'custom'],
    default: 'custom'
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  target: {
    min: Number,
    max: Number,
    ideal: Number
  },
  icon: {
    type: String,
    default: 'activity'
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  trackFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'asNeeded'],
    default: 'daily'
  },
  source: {
    type: String,
    enum: ['manual', 'huawei', 'cultfit', 'imported', 'other'],
    default: 'manual'
  },
  values: [metricValueSchema],
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

// Virtual for current value
healthMetricSchema.virtual('currentValue').get(function() {
  if (this.values && this.values.length > 0) {
    // Sort values by timestamp in descending order
    const sortedValues = [...this.values].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    return sortedValues[0];
  }
  return null;
});

// Virtual for trend calculation
healthMetricSchema.virtual('trend').get(function() {
  if (this.values && this.values.length >= 2) {
    // Sort values by timestamp in descending order
    const sortedValues = [...this.values].sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
    
    // Get the current and previous values
    const current = sortedValues[0].value;
    const previous = sortedValues[1].value;
    
    // Calculate percentage change
    const change = ((current - previous) / previous) * 100;
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
      percentage: Math.abs(change).toFixed(2),
      raw: change
    };
  }
  return { direction: 'stable', percentage: 0, raw: 0 };
});

// Indexes for faster queries
healthMetricSchema.index({ type: 1 });
healthMetricSchema.index({ "values.timestamp": 1 });

const HealthMetric = mongoose.model('HealthMetric', healthMetricSchema);

module.exports = HealthMetric;