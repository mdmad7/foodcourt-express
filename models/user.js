import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new Schema(
  {
    name: {
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
    },
    gender: {
      type: String,
      enum: ['Male', 'Female'],
    },
    date_of_birth: {
      type: Date,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    friends: [{ type: Schema.ObjectId, ref: 'User' }],
    favourite_vendors: [{ type: Schema.ObjectId, ref: 'Vendor' }],
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
