import mongoose, { Schema } from 'mongoose';

const MenuSchema = new Schema(
  {
    vendor_id: { type: Schema.ObjectId, ref: 'Vendor' },
    day_of_week: {
      type: String,
      enum: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
    },
    menu_item: [
      {
        meal_id: { type: Schema.ObjectId, ref: 'Meal' },
        meal_time: {
          type: String,
          enum: ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
        },
        availability_time: { type: String },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

export default mongoose.model('Menu', MenuSchema);
