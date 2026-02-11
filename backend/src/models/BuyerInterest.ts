import mongoose, { Document, Schema } from 'mongoose';

export interface IBuyerInterest extends Document {
  _id: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  buyerName: string;
  buyerPhone: string;
  message?: string;
  status: 'pending' | 'contacted' | 'converted' | 'rejected';
  notifiedBrokers: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const buyerInterestSchema = new Schema<IBuyerInterest>(
  {
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: [true, 'Please provide a phone number'],
      match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit phone number'],
    },
    message: {
      type: String,
      maxlength: [500, 'Message cannot be more than 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'converted', 'rejected'],
      default: 'pending',
    },
    notifiedBrokers: [{
      type: Schema.Types.ObjectId,
      ref: 'Broker',
    }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IBuyerInterest>('BuyerInterest', buyerInterestSchema);