import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    first_name: {
      type: String,
      required: true,
      lowercase: true,
    },
    last_name: {
      type: String,
      required: true,
      lowercase: true,
    },
    other_names: {
      type: String,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    hasDeleted: {
      type: Boolean,
      default: false,
    },
    friends: {},
    favourite_vendors: {},
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
  },
);

UserSchema.pre('save', async function savePassword(next) {
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

UserSchema.methods.isValidPassword = async function comparePassword(
  newPassword,
) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    throw new Error(error);
  }
};

// Export model
export default mongoose.model('User', UserSchema);
