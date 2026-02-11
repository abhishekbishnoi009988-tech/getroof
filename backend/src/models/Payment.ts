import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  broker: mongoose.Types.ObjectId;
  propertyType: 'residential' | 'commercial';
  saleAmount: number;
  commissionRate: number; // 1.25%
  totalCommission: number; // 1.25% of sale
  brokerShare: number; // 45% of commission
  platformShare: number; // 55% of commission
  paymentStatus: 'pending' | 'completed' | 'failed';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  payerName?: string;
  payerPhone?: string;
  paymentDetails?: {
    method?: string;
    completedAt?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    broker: {
      type: Schema.Types.ObjectId,
      ref: 'Broker',
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['residential', 'commercial'],
      required: true,
    },
    saleAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      default: 1.25, // 1.25%
    },
    totalCommission: {
      type: Number,
      required: true,
    },
    brokerShare: {
      type: Number,
      required: true,
    },
    platformShare: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    payerName: String,
    payerPhone: String,
    paymentDetails: {
      method: String,
      completedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);