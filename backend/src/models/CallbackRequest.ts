import mongoose, { Document, Schema } from 'mongoose';

export interface ICallbackRequest extends Document {
  phone: string;
  name?: string;
  message?: string;
  status: 'pending' | 'called' | 'resolved';
  createdAt: Date;
}

const callbackRequestSchema = new Schema<ICallbackRequest>(
  {
    phone: { type: String, required: true },
    name: { type: String },
    message: { type: String },
    status: {
      type: String,
      enum: ['pending', 'called', 'resolved'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICallbackRequest>('CallbackRequest', callbackRequestSchema);