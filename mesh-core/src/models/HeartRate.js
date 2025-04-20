import mongoose from 'mongoose';

const HeartRateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  min: { type: Number },
  max: { type: Number }
}, { timestamps: true });

export default mongoose.models.HeartRate || mongoose.model('HeartRate', HeartRateSchema);
