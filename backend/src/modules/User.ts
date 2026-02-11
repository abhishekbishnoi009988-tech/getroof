import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  googleId: string;
  email: string;
  name: string;
  profilePicture?: string;
  role: 'buyer' | 'seller' | 'broker' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    profilePicture: String,
    role: {
      type: String,
      enum: ['buyer', 'seller', 'broker', 'admin'],
      default: 'buyer',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);