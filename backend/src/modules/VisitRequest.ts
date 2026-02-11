import mongoose, { Document, Schema } from 'mongoose';

export interface IVisitRequest extends Document {
  buyer: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  broker: mongoose.Types.ObjectId;
  payment: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  brokerEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

const visitRequestSchema = new Schema<IVisitRequest>(
  {
    buyer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    broker: {
      type: Schema.Types.ObjectId,
      ref: 'Broker',
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: 'Payment',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'completed', 'cancelled'],
      default: 'pending',
    },
    brokerEarnings: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVisitRequest>('VisitRequest', visitRequestSchema);