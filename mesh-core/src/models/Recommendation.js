import mongoose from 'mongoose';

const RecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['movie', 'tvshow', 'book', 'podcast'], required: true },
  title: { type: String, required: true },
  genre: { type: String },
  language: { type: String },
  director: { type: String },
  author: { type: String },
  reason: { type: String },
  source: { type: String, enum: ['gemini', 'manual'], default: 'gemini' }
}, { timestamps: true });

export default mongoose.models.Recommendation || mongoose.model('Recommendation', RecommendationSchema);
