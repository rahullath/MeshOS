import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  billingCycle: { type: String }, // e.g., "monthly", "yearly"
  renewalDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
