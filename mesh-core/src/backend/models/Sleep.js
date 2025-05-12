// mesh-core/src/backend/models/Sleep.js
const mongoose = require('mongoose');

const sleepSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    unique: true
  },
  bedtime: {
    type: Date,
    required: true
  },
  wakeTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,  // in minutes
    required: true
  },
  quality: {
    type: Number,  // 1-10 scale
    min: 1,
    max: 10,
    default: 5
  },
  deepSleep: {
    type: Number,  // in minutes
    default: 0
  },
  lightSleep: {
    type: Number,  // in minutes
    default: 0
  },
  remSleep: {
    type: Number,  // in minutes
    default: 0
  },
  awakeTime: {
    type: Number,  // in minutes
    default: 0
  },
  interruptions: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  tags: [String],
  source: {
    type: String,
    enum: ['manual', 'huawei', 'imported', 'other'],
    default: 'manual'
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

// Virtual for sleep score calculation
sleepSchema.virtual('sleepScore').get(function() {
  // Basic sleep score calculation
  // 50% from duration (ideal is 7-9 hours)
  // 30% from quality rating
  // 20% from sleep composition (deep sleep percentage)
  
  let durationScore = 0;
  const durationHours = this.duration / 60;
  
  // Duration score calculation
  if (durationHours >= 7 && durationHours <= 9) {
    durationScore = 50; // Ideal sleep duration
  } else if (durationHours >= 6 && durationHours < 7) {
    durationScore = 40;
  } else if (durationHours > 9 && durationHours <= 10) {
    durationScore = 40;
  } else if (durationHours >= 5 && durationHours < 6) {
    durationScore = 30;
  } else if (durationHours > 10) {
    durationScore = 30;
  } else {
    durationScore = Math.max(0, durationHours * 5); // Minimum score
  }
  
  // Quality score calculation
  const qualityScore = (this.quality / 10) * 30;
  
  // Composition score calculation
  let compositionScore = 0;
  if (this.deepSleep && this.duration > 0) {
    const deepSleepPercentage = (this.deepSleep / this.duration) * 100;
    // Ideal deep sleep is about 20-25% of total sleep
    if (deepSleepPercentage >= 20 && deepSleepPercentage <= 25) {
      compositionScore = 20;
    } else if (deepSleepPercentage >= 15 && deepSleepPercentage < 20) {
      compositionScore = 15;
    } else if (deepSleepPercentage > 25 && deepSleepPercentage <= 30) {
      compositionScore = 15;
    } else if (deepSleepPercentage >= 10 && deepSleepPercentage < 15) {
      compositionScore = 10;
    } else if (deepSleepPercentage > 30) {
      compositionScore = 10;
    } else {
      compositionScore = Math.max(0, deepSleepPercentage);
    }
  } else {
    // If no deep sleep data, estimate from quality
    compositionScore = (this.quality / 10) * 20;
  }
  
  return Math.round(durationScore + qualityScore + compositionScore);
});

// Method to calculate if this is part of a consistent sleep schedule
sleepSchema.methods.isConsistentSchedule = async function(days = 7) {
  try {
    // Get the date for this sleep record
    const currentDate = new Date(this.date);
    currentDate.setHours(0, 0, 0, 0);
    
    // Calculate the date 'days' days ago
    const startDate = new Date(currentDate);
    startDate.setDate(startDate.getDate() - days);
    
    // Find all sleep records between startDate and currentDate (excluding current)
    const previousSleeps = await this.constructor.find({
      date: {
        $gte: startDate,
        $lt: currentDate
      }
    }).sort({ date: -1 });
    
    if (previousSleeps.length < days - 1) {
      return { consistent: false, reason: 'insufficient-data' };
    }
    
    // Extract bedtimes and calculate variance
    const bedtimes = previousSleeps.map(sleep => {
      const bedtime = new Date(sleep.bedtime);
      // Convert to minutes from midnight
      return (bedtime.getHours() * 60 + bedtime.getMinutes()) % (24 * 60);
    });
    
    // Add current bedtime
    const currentBedtime = new Date(this.bedtime);
    bedtimes.push((currentBedtime.getHours() * 60 + currentBedtime.getMinutes()) % (24 * 60));
    
    // Calculate standard deviation of bedtimes
    const mean = bedtimes.reduce((sum, time) => sum + time, 0) / bedtimes.length;
    const variance = bedtimes.reduce((sum, time) => {
      // Handle the case of bedtimes around midnight (e.g., 11:30 PM vs 12:30 AM)
      let diff = Math.abs(time - mean);
      if (diff > 12 * 60) diff = 24 * 60 - diff; // If difference is more than 12 hours, take the shorter way around the clock
      return sum + diff * diff;
    }, 0) / bedtimes.length;
    const stdDev = Math.sqrt(variance);
    
    // Consider consistent if standard deviation is less than 60 minutes
    return { 
      consistent: stdDev < 60,
      stdDev,
      averageBedtime: mean,
      reason: stdDev < 60 ? 'consistent' : 'irregular'
    };
  } catch (error) {
    console.error('Error calculating sleep consistency:', error);
    return { consistent: false, reason: 'error' };
  }
};

// Indexes for faster queries
sleepSchema.index({ date: -1 });
sleepSchema.index({ quality: 1 });
sleepSchema.index({ duration: 1 });

const Sleep = mongoose.model('Sleep', sleepSchema);

module.exports = Sleep;