import mongoose from 'mongoose';

const GrocerySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, default: 1 },
  expirationDate: { type: Date },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Grocery || mongoose.model('Grocery', GrocerySchema);
