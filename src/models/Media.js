import mongoose from 'mongoose';

const MediaSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['movie', 'tvshow', 'book', 'podcast'], required: true },
  title: { type: String, required: true },
  genre: { type: String },
  language: { type: String },
  director: { type: String },
  author: { type: String },
  completed: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Media || mongoose.model('Media', MediaSchema);
