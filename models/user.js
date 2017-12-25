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
      family_name: {
        type: String,
        required: true,
        lowercase: true,
      },
      other_names: {
        type: String,
        lowercase: true,
      },
      full_name: {
        type: String,
        lowercase: true,
      },
    },
    img: {
      original: {
        type: String,
      },
      thumbnail720x720: {
        type: String,
      },
      thumbnail360x360: {
        type: String,
      },
      thumbnail180x180: {
        type: String,
      },
    },
    gender: {
      type: String,
      enum: ['male', 'female'],
      required: true,
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
    role: {
      type: String,
      enum: ['administrator', 'user'],
      default: 'user',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    friends: [{ type: Schema.ObjectId, ref: 'User' }],
    favourite_vendors: [{ type: Schema.ObjectId, ref: 'Vendor' }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true, getters: true },
    toObject: { virtuals: true, getters: true },
  },
);

UserSchema.pre('save', async function savePassword(next) {
  if (this.password) {
    try {
      // Generate a salt
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(this.password, salt);
      this.password = passwordHash;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    return false;
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
