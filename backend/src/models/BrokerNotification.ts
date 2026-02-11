import mongoose, { Document, Schema } from 'mongoose';

export interface IBrokerNotification extends Document {
  broker: mongoose.Types.ObjectId;
  property: mongoose.Types.ObjectId;
  buyerName: string;
  buyerPhone: string;
  message: string;
  status: 'pending' | 'contacted' | 'closed';
  createdAt: Date;
  updatedAt: Date;
}

const brokerNotificationSchema = new Schema<IBrokerNotification>(
  {
    broker: {
      type: Schema.Types.ObjectId,
      ref: 'Broker',
      required: true,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    buyerPhone: {
      type: String,
      required: true,
    },
    message: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'closed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
brokerNotificationSchema.index({ broker: 1, status: 1 });
brokerNotificationSchema.index({ property: 1 });
brokerNotificationSchema.index({ createdAt: -1 });

export default mongoose.model<IBrokerNotification>(
  'BrokerNotification',
  brokerNotificationSchema
);