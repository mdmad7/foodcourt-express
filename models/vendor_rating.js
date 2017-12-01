import mongoose, { Schema } from 'mongoose';

const VendorRatingSchema = new Schema(
  {
    vendor_id: { type: Schema.ObjectId, ref: 'Vendor' },
    user_id: { type: Schema.ObjectId, ref: 'User' },
    value: { type: Number, min: 0, max: 5 },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

export default mongoose.model('VendorRating', VendorRatingSchema);
