// mesh-core/src/backend/models/Medication.js
const mongoose = require('mongoose');

const medicationDoseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  taken: {
    type: Boolean,
    default: false
  },
  skipped: {
    type: Boolean,
    default: false
  },
  actualTime: {
    type: Date
  },
  notes: {
    type: String
  }
});

const medicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Medication name is required'],
    trim: true
  },
  dosage: {
    type: String,
    required: [true, 'Dosage information is required']
  },
  frequency: {
    type: String,
    enum: ['once', 'twice', 'three-times', 'four-times', 'as-needed', 'custom'],
    default: 'once'
  },
  customFrequency: {
    type: String
  },
  schedule: [{
    time: Date, // Time of day for the dose
    daysOfWeek: [Number] // 0 = Sunday, 1 = Monday, etc. (empty array means every day)
  }],
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  instructions: {
    type: String
  },
  withFood: {
    type: Boolean,
    default: false
  },
  purpose: {
    type: String
  },
  category: {
    type: String,
    enum: ['prescription', 'otc', 'supplement', 'other'],
    default: 'prescription'
  },
  stock: {
    current: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: 'pills'
    },
    lowAlert: {
      type: Number,
      default: 5
    }
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: true
    },
    minutesBefore: {
      type: Number,
      default: 15
    }
  },
  doses: [medicationDoseSchema],
  active: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  icon: {
    type: String,
    default: 'pill'
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

// Virtual for adherence rate
medicationSchema.virtual('adherenceRate').get(function() {
  if (!this.doses || this.doses.length === 0) return 100;
  
  const totalDoses = this.doses.length;
  const takenDoses = this.doses.filter(dose => dose.taken).length;
  
  return Math.round((takenDoses / totalDoses) * 100);
});

// Virtual for doses due today
medicationSchema.virtual('todayDoses').get(function() {
  // Get today's date (start of day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Get tomorrow's date (start of day)
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Calculate doses due today
  const scheduledToday = [];
  
  // Check if medication is active
  if (!this.active) return scheduledToday;
  
  // Check if today is between start and end dates
  if (this.startDate > today || (this.endDate && this.endDate < today)) return scheduledToday;
  
  // Get day of week (0 = Sunday, 1 = Monday, etc.)
  const dayOfWeek = today.getDay();
  
  // Process schedule
  this.schedule.forEach(scheduleItem => {
    // If no specific days are set, or today is in the list of days
    if (!scheduleItem.daysOfWeek || scheduleItem.daysOfWeek.length === 0 || scheduleItem.daysOfWeek.includes(dayOfWeek)) {
      // Create a new Date object for the scheduled time
      const scheduledTime = new Date(scheduleItem.time);
      
      // Set the date part to today
      scheduledTime.setFullYear(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Find if there's a dose record for this time
      const doseRecord = this.doses.find(dose => {
        const doseDate = new Date(dose.date);
        return doseDate >= today && 
               doseDate < tomorrow && 
               doseDate.getHours() === scheduledTime.getHours() && 
               doseDate.getMinutes() === scheduledTime.getMinutes();
      });
      
      // Add to scheduled doses
      scheduledToday.push({
        time: scheduledTime,
        taken: doseRecord ? doseRecord.taken : false,
        skipped: doseRecord ? doseRecord.skipped : false,
        doseId: doseRecord ? doseRecord._id : null
      });
    }
  });
  
  return scheduledToday.sort((a, b) => a.time - b.time);
});

// Virtual for low stock warning
medicationSchema.virtual('isLowStock').get(function() {
  return this.stock && this.stock.current <= this.stock.lowAlert;
});

// Middleware to update timestamps
medicationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
medicationSchema.index({ active: 1 });
medicationSchema.index({ name: 1 });
medicationSchema.index({ category: 1 });
medicationSchema.index({ "doses.date": 1 });

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;