import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  seller: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  address: {
    street: string;
    city: string;
    state: string;
    pinCode: string;
  };
  propertyType: 'house' | 'apartment' | 'villa' | 'plot' | 'commercial' | 'hostel' | 'pg';
  listingType: 'sale' | 'rent';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  amenities: string[];
  images: string[];
  video?: string;
  ownerPhone?: string;
  status: 'active' | 'sold' | 'rented';
  // Hostel/PG specific
  hostelName?: string;
  gender?: 'boys' | 'girls' | 'coed' | 'any';
  hostelAmenities?: string[];
  rules?: string;
  timings?: string;
  // Broker listing fields
  listedBy?: 'owner' | 'broker';
  listedByBroker?: mongoose.Types.ObjectId;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please add street address'],
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
        required: [true, 'Please add PIN code'],
        match: [/^\d{6}$/, 'Please add a valid 6-digit PIN code'],
      },
    },
    propertyType: {
      type: String,
      enum: ['house', 'apartment', 'villa', 'plot', 'commercial', 'hostel', 'pg'],
      required: true,
    },
    listingType: {
      type: String,
      enum: ['sale', 'rent'],
      required: true,
    },
    area: {
      type: Number,
      default: 1,
    },
    bedrooms: Number,
    bathrooms: Number,
    amenities: [String],
    images: [String],
    video: {
      type: String,
    },
    ownerPhone: {
      type: String,
      match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit mobile number'],
    },
    status: {
      type: String,
      enum: ['active', 'sold', 'rented'],
      default: 'active',
    },
    // Hostel/PG specific fields
    hostelName: {
      type: String,
      trim: true,
    },
    gender: {
      type: String,
      enum: ['boys', 'girls', 'coed', 'any'],
      default: 'any',
    },
    hostelAmenities: [String],
    rules: {
      type: String,
    },
    timings: {
      type: String,
    },
    // Broker listing fields
    listedBy: {
      type: String,
      enum: ['owner', 'broker'],
      default: 'owner',
    },
    listedByBroker: {
      type: Schema.Types.ObjectId,
      ref: 'Broker',
    },
    moderationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

propertySchema.index({ 'address.pinCode': 1 });
propertySchema.index({ listingType: 1 });
propertySchema.index({ status: 1 });
propertySchema.index({ propertyType: 1 });
propertySchema.index({ 'address.city': 1 });

export default mongoose.model<IProperty>('Property', propertySchema);