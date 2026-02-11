import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password?: string; // Make optional for Google users
  googleId?: string; // Add this
  role: 'user' | 'broker' | 'admin';
  phone?: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getSignedJwtToken(): string;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      minlength: 6,
      select: false,
      // Remove 'required' - not needed for Google users
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow null values, but enforce uniqueness when present
    },
    role: {
      type: String,
      enum: ['user', 'broker', 'admin'],
      default: 'user',
    },
    phone: {
      type: String,
    },
    profilePicture: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password exists)
userSchema.pre('save', async function (next) {
  // Skip if password is not modified or doesn't exist
  if (!this.password || !this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  // If no password exists (Google user), return false
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.getSignedJwtToken = function (): string {
  const secret = process.env.JWT_SECRET as string;

  return jwt.sign(
    { id: this._id.toString() },
    secret,
    { expiresIn: '30d' }
  );
};

export default mongoose.model<IUser>('User', userSchema);