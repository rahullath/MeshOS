import mongoose from 'mongoose';

const FinanceTransactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  category: { type: String },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  type: { type: String, enum: ['income', 'expense'], required: true },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.FinanceTransaction || mongoose.model('FinanceTransaction', FinanceTransactionSchema);
