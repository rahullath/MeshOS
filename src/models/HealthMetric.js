import mongoose from 'mongoose';

const HealthMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  weight: { type: Number },
  sleepHours: { type: Number },
  activityLevel: { type: String, enum: ['sedentary', 'light', 'moderate', 'active'] },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.HealthMetric || mongoose.model('HealthMetric', HealthMetricSchema);
