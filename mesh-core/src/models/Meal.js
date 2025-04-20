import mongoose from 'mongoose';

const MealSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  name: { type: String, required: true }, // e.g., "Breakfast", "Lunch", "Dinner"
  ingredients: [{
    name: { type: String },
    quantity: { type: String }
  }],
  calories: { type: Number },
  notes: { type: String }
}, { timestamps: true });

export default mongoose.models.Meal || mongoose.model('Meal', MealSchema);
