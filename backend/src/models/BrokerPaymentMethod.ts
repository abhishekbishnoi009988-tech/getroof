import mongoose, { Document, Schema } from 'mongoose';

export interface IBrokerPaymentMethod extends Document {
  broker: mongoose.Types.ObjectId;
  paymentMethod: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const brokerPaymentMethodSchema = new Schema<IBrokerPaymentMethod>(
  {
    broker: { type: Schema.Types.ObjectId, ref: 'Broker', required: true, unique: true },
    paymentMethod: { type: String, enum: ['upi', 'bank'], required: true },
    upiId: String,
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBrokerPaymentMethod>('BrokerPaymentMethod', brokerPaymentMethodSchema);