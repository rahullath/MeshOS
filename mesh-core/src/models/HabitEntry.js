import mongoose from 'mongoose';

const HabitEntrySchema = new mongoose.Schema({
  habitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  date: { type: Date, required: true },
  value: { type: Number, default: 1 },
  notes: { type: String }
}, { timestamps: true });

HabitEntrySchema.index({ habitId: 1, date: 1 }, { unique: true });

export default mongoose.models.HabitEntry || mongoose.model('HabitEntry', HabitEntrySchema);
