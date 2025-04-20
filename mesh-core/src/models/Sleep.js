import mongoose from 'mongoose';

const SleepSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hours: { type: Number },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Sleep || mongoose.model('Sleep', SleepSchema);
