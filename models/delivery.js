import mongoose, { Schema } from 'mongoose';

const DeliverySchema = new Schema({
  delivery_location: {
    type: [Number],
  },
  status: {
    type: String,
    enum: ['Pending', 'In Transit', 'Delivered', 'Cancelled'],
    default: 'Pending',
  },
});

DeliverySchema.index({ delivery_location: 1 }, { name: '2dsphere' });

export default mongoose.model('Delivery', DeliverySchema);
