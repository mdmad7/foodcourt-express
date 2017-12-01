import mongoose, { Schema } from 'mongoose';

const MealRatingSchema = new Schema(
  {
    meal_id: { type: Schema.ObjectId, ref: 'Meal' },
    user_id: { type: Schema.ObjectId, ref: 'User' },
    value: { type: Number, min: 0, max: 5 },
    // comment: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

export default mongoose.model('MealRating', MealRatingSchema);
