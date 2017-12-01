import mongoose, { Schema } from 'mongoose';

const MealSchema = new Schema(
  {
    imgUrl: {
      type: String,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      min: 2,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

export default mongoose.model('Meal', MealSchema);
