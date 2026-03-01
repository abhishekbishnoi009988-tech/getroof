import mongoose, { Document, Schema } from 'mongoose';

export interface IPayment extends Document {
  // Old fields
  user?: mongoose.Types.ObjectId;
  property?: mongoose.Types.ObjectId;
  amount?: number;
  type?: 'booking' | 'listing';
  status?: 'pending' | 'completed' | 'refunded';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  // New Cashfree fields
  broker?: mongoose.Types.ObjectId;
  propertyId?: mongoose.Types.ObjectId;
  notificationId?: mongoose.Types.ObjectId;
  propertyType?: 'residential' | 'commercial';
  saleAmount?: number;
  commissionRate?: number;
  totalCommission?: number;
  brokerShare?: number;
  platformShare?: number;
  cashfreeOrderId?: string;
  cashfreePaymentId?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  payerName?: string;
  payerPhone?: string;
  paymentDetails?: object;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    // Old fields - kept for backward compatibility
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    property: { type: Schema.Types.ObjectId, ref: 'Property' },
    amount: { type: Number },
    type: { type: String, enum: ['booking', 'listing'] },
    status: { type: String, enum: ['pending', 'completed', 'refunded'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,

    // New Cashfree fields
    broker: { type: Schema.Types.ObjectId, ref: 'Broker' },
    propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
    notificationId: { type: Schema.Types.ObjectId, ref: 'BrokerNotification' },
    propertyType: { type: String, enum: ['residential', 'commercial'] },
    saleAmount: { type: Number },
    commissionRate: { type: Number, default: 1.25 },
    totalCommission: { type: Number },
    brokerShare: { type: Number },
    platformShare: { type: Number },
    cashfreeOrderId: { type: String },
    cashfreePaymentId: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
    payerName: { type: String },
    payerPhone: { type: String },
    paymentDetails: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model<IPayment>('Payment', paymentSchema);