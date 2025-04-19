// src/models/Habit.js
import mongoose from 'mongoose';

/* Check if the model already exists before defining */
const HabitSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['positive', 'negative'], required: true },
  frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
  goal: { type: Number, default: 1 },
  color: { type: String, default: '#4287f5' },
  icon: { type: String, default: 'check' },
  notes: { type: String },
  archived: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Habit || mongoose.model('Habit', HabitSchema);
