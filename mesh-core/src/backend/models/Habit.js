// mesh-core/src/backend/models/Habit.js
const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  category: {
    type: String,
    default: 'general'
  },
  streak: {
    type: Number,
    default: 0
  },
  history: [{
    date: {
      type: Date,
      required: true
    },
    completed: {
      type: Boolean,
      default: false
    },
    notes: {
      type: String,
      default: ''
    },
    value: {
      type: Number,
      default: 1
    }
  }],
  target: {
    value: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      default: 'times'
    }
  },
  reminderTime: {
    type: Date,
    default: null
  },
  color: {
    type: String,
    default: '#3b82f6' // Default blue color
  },
  icon: {
    type: String,
    default: 'check-circle' // Default icon
  },
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

// Virtual for completion rate
habitSchema.virtual('completionRate').get(function() {
  if (!this.history || this.history.length === 0) return 0;
  
  const completedCount = this.history.filter(entry => entry.completed).length;
  return (completedCount / this.history.length) * 100;
});

// Virtual for current streak (calculated on demand)
habitSchema.virtual('currentStreak').get(function() {
  if (!this.history || this.history.length === 0) return 0;
  
  // Sort history by date in descending order
  const sortedHistory = [...this.history].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  let streak = 0;
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  // Check if the most recent entry is today or yesterday (to maintain streak)
  const mostRecentDate = new Date(sortedHistory[0].date);
  if (!this._isSameDay(mostRecentDate, today) && !this._isSameDay(mostRecentDate, yesterday)) {
    return 0;
  }
  
  // Calculate streak
  let currentDate = mostRecentDate;
  
  for (let i = 0; i < sortedHistory.length; i++) {
    const entryDate = new Date(sortedHistory[i].date);
    
    // If entry was completed and is consecutive
    if (sortedHistory[i].completed && 
        (i === 0 || this._isConsecutiveDay(currentDate, entryDate))) {
      streak++;
      currentDate = entryDate;
    } else if (!sortedHistory[i].completed) {
      break;
    }
  }
  
  return streak;
});

// Helper method to check if two dates are the same day
habitSchema.methods._isSameDay = function(date1, date2) {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

// Helper method to check if two dates are consecutive days
habitSchema.methods._isConsecutiveDay = function(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  const diffTime = d1.getTime() - d2.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays === 1;
};

// Indexes for faster queries
habitSchema.index({ type: 1 });
habitSchema.index({ category: 1 });
habitSchema.index({ "history.date": 1 });

const Habit = mongoose.model('Habit', habitSchema);

module.exports = Habit;
