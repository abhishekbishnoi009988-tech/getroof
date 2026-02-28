import mongoose, { Document, Schema } from 'mongoose';

export interface IWithdrawalRequest extends Document {
  broker: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: 'upi' | 'bank';
  upiId?: string;
  bankDetails?: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  adminNote?: string;
  createdAt: Date;
  updatedAt: Date;
}

const withdrawalRequestSchema = new Schema<IWithdrawalRequest>(
  {
    broker: { type: Schema.Types.ObjectId, ref: 'Broker', required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { type: String, enum: ['upi', 'bank'], required: true },
    upiId: { type: String },
    bankDetails: {
      accountHolderName: String,
      accountNumber: String,
      ifscCode: String,
      bankName: String,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'paid'],
      default: 'pending',
    },
    adminNote: String,
  },
  { timestamps: true }
);

export default mongoose.model<IWithdrawalRequest>('WithdrawalRequest', withdrawalRequestSchema);