import mongoose, { Document, Schema } from 'mongoose';

export interface IBroker extends Document {
  user: mongoose.Types.ObjectId;
  licenseNumber: string;
  yearsOfExperience: number;
  specialization: string;
  description: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  officeLocation: {
    address: string;
    city: string;
    state: string;
    pinCode?: string; // ✅ MADE OPTIONAL
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  serviceRadius: number;
  servicePinCodes?: string[]; // ✅ MADE OPTIONAL
  createdAt: Date;
  updatedAt: Date;
}

const brokerSchema = new Schema<IBroker>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    licenseNumber: {
      type: String,
      required: [true, 'Please add a license number'],
    },
    yearsOfExperience: {
      type: Number,
      required: [true, 'Please add years of experience'],
      min: [0, 'Years of experience cannot be negative'],
    },
    specialization: {
      type: String,
      required: [true, 'Please add a specialization'],
      enum: [
        'Residential Properties',
        'Commercial Properties',
        'Luxury Properties',
        'Rental Properties',
        'Industrial Properties',
        'Land/Plot',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      minlength: [100, 'Description must be at least 100 characters'],
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
    },
    officeLocation: {
      address: {
        type: String,
        required: [true, 'Please add office address'],
      },
      city: {
        type: String,
        required: [true, 'Please add city'],
      },
      state: {
        type: String,
        required: [true, 'Please add state'],
      },
      pinCode: {
        type: String,
        required: false, // ✅ NOT REQUIRED - Won't block approval
      },
      coordinates: {
        lat: {
          type: Number,
          required: [true, 'Please add latitude'],
        },
        lng: {
          type: Number,
          required: [true, 'Please add longitude'],
        },
      },
    },
    serviceRadius: {
      type: Number,
      default: 10,
      min: [1, 'Service radius must be at least 1km'],
      max: [50, 'Service radius cannot exceed 50km'],
    },
    servicePinCodes: {
      type: [String],
      required: false, // ✅ NOT REQUIRED - Won't block approval
      validate: {
        validator: function(v: string[]) {
          // Only validate if array exists and has items
          if (!v || v.length === 0) return true;
          return v.length >= 1 && v.length <= 10;
        },
        message: 'Please add between 1 and 10 service PIN codes'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
brokerSchema.index({ 'officeLocation.coordinates': '2dsphere' });
brokerSchema.index({ verificationStatus: 1 });
brokerSchema.index({ user: 1 });

export default mongoose.model<IBroker>('Broker', brokerSchema);