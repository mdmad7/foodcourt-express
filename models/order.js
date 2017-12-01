import mongoose, { Schema } from 'mongoose';

const OrderSchema = new Schema(
  {
    user_id: { type: Schema.ObjectId, ref: 'User' },
    vendor_id: { type: Schema.ObjectId, ref: 'Vendor' },
    meal_id: [{ type: Schema.ObjectId, ref: 'Meal' }],
    total_cost: { type: Number, min: 2 },
    delivery: { type: Schema.ObjectId, ref: 'Delivery' },
    order_type: {
      type: String,
      enum: ['Pick Up', 'Delivery'],
    },
    status: {
      type: String,
      enum: [
        'Processing',
        'Processed',
        'Delievering',
        'Delievered',
        'Cancelled',
      ],
      default: 'Processing',
    },
    payment_method: {
      vendor: { type: String, required: true },
      payment_code: { type: String, required: true, trim: true },
    },
    // Custom generated unique id of
    // Format VENDOR-CODE:USER-CODE:DATE:TIME
    receipt_code: {
      type: String,
      lowercase: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

OrderSchema.index({ user_id: 1, vendor_id: 1 });

export default mongoose.model('Order', OrderSchema);
