import mongoose from 'mongoose';

const ScreenTimeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  app: { type: String, required: true },
  duration: { type: Number }, // in minutes
  category: { type: String }, // e.g., "social", "productivity", "entertainment"
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.ScreenTime || mongoose.model('ScreenTime', ScreenTimeSchema);
