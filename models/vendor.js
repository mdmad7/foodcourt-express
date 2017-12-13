import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const VendorSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      lowercase: true,
    },
    owner: [{ type: Schema.ObjectId, ref: 'User' }],
    address: {
      house_number: { type: String },
      street_name: { type: String },
      town_city: { type: String },
      region_state: { type: String },
      coordinates: { type: [Number] },
    },
    tel: [{ type: String }],
    opens_at: { type: String },
    closes_at: { type: String },
    payment_method: [
      {
        name: { type: String },
        vendor: { type: String },
        payment_number: { type: String },
      },
    ],
    branch: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, trim: true },
    isDeleted: { type: Boolean, default: false },
    clients: [{ type: Schema.ObjectId, ref: 'User' }],
    rate_count: { type: Number },
    rate_value: { type: Number },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

VendorSchema.index({ address: { coordinates: 1 } }, { name: '2dsphere' });

VendorSchema.pre('save', async function savePassword(next) {
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(this.password, salt);
    this.password = passwordHash;
    next();
  } catch (error) {
    next(error);
  }
});

VendorSchema.methods.isValidPassword = async function comparePassword(
  newPassword,
) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Export model
export default mongoose.model('Vendor', VendorSchema);
