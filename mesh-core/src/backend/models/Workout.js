// mesh-core/src/backend/models/Workout.js
const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  sets: [{
    reps: Number,
    weight: Number,
    duration: Number, // in seconds
    distance: Number, // in meters
    completed: {
      type: Boolean,
      default: true
    },
    notes: String
  }],
  type: {
    type: String,
    enum: ['strength', 'cardio', 'flexibility', 'balance', 'other'],
    default: 'strength'
  },
  muscleGroup: {
    type: String,
    enum: ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'full-body', 'other'],
    default: 'other'
  }
});

const workoutSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Workout title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['strength', 'cardio', 'hiit', 'yoga', 'pilates', 'stretching', 'crossfit', 'custom'],
    default: 'strength'
  },
  location: {
    type: String,
    enum: ['gym', 'home', 'outdoors', 'cultfit', 'other'],
    default: 'gym'
  },
  duration: {
    type: Number, // in minutes
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  feelingRating: {
    type: Number, // 1-10 scale
    min: 1,
    max: 10
  },
  intensityRating: {
    type: Number, // 1-10 scale
    min: 1,
    max: 10
  },
  exercises: [exerciseSchema],
  notes: {
    type: String
  },
  source: {
    type: String,
    enum: ['manual', 'cultfit', 'imported', 'other'],
    default: 'manual'
  },
  sourceId: {
    type: String // ID from external source like cult.fit
  },
  completed: {
    type: Boolean,
    default: true
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

// Virtual for total volume (for strength workouts)
workoutSchema.virtual('totalVolume').get(function() {
  if (!this.exercises) return 0;
  
  return this.exercises.reduce((total, exercise) => {
    if (exercise.type !== 'strength') return total;
    
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      if (!set.completed) return setTotal;
      return setTotal + (set.reps || 0) * (set.weight || 0);
    }, 0);
    
    return total + exerciseVolume;
  }, 0);
});

// Virtual for total distance (for cardio workouts)
workoutSchema.virtual('totalDistance').get(function() {
  if (!this.exercises) return 0;
  
  return this.exercises.reduce((total, exercise) => {
    if (exercise.type !== 'cardio') return total;
    
    const exerciseDistance = exercise.sets.reduce((setTotal, set) => {
      if (!set.completed) return setTotal;
      return setTotal + (set.distance || 0);
    }, 0);
    
    return total + exerciseDistance;
  }, 0);
});

// Virtual for calculating if this is the same workout routine as another
workoutSchema.virtual('sameRoutineAs', {
  ref: 'Workout',
  localField: 'exercises.name',
  foreignField: 'exercises.name',
  count: true
});

// Middleware to update timestamps
workoutSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for faster queries
workoutSchema.index({ date: -1 });
workoutSchema.index({ type: 1 });
workoutSchema.index({ location: 1 });

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout;