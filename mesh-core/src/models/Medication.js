import mongoose from 'mongoose';

const MedicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  dosage: { type: String },
  frequency: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Medication || mongoose.model('Medication', MedicationSchema);
