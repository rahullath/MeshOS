import mongoose from 'mongoose';

const CryptoHoldingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true }, // e.g., "Bitcoin", "Ethereum"
  symbol: { type: String, required: true }, // e.g., "BTC", "ETH"
  quantity: { type: Number, required: true },
  purchaseDate: { type: Date },
  purchasePrice: { type: Number },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.CryptoHolding || mongoose.model('CryptoHolding', CryptoHoldingSchema);
