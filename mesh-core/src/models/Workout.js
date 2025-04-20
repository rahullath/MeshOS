import mongoose from 'mongoose';

const WorkoutSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  type: { type: String, required: true }, // e.g., "Gym", "Running", "Yoga"
  duration: { type: Number }, // in minutes
  caloriesBurned: { type: Number },
  notes: { type: String },
  exercises: [{
    name: { type: String },
    sets: { type: Number },
    reps: { type: Number },
    weight: { type: Number }
  }]
}, { timestamps: true });

export default mongoose.models.Workout || mongoose.model('Workout', WorkoutSchema);
