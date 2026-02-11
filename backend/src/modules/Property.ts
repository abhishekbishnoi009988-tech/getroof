import mongoose, { Document, Schema } from 'mongoose';

export interface IProperty extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  price: number;
  listingFee: number;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  propertyType: 'house' | 'apartment' | 'villa' | 'plot' | 'commercial';
  listingType: 'sale' | 'rent';
  listedBy: 'broker' | 'owner'; // NEW FIELD
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  amenities?: string[];
  status: 'available' | 'sold' | 'rented' | 'pending';
  seller: mongoose.Types.ObjectId;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const propertySchema = new Schema<IProperty>(
  {
    title: {
      type: String,
      required: [true, 'Please add a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price cannot be negative'],
    },
    listingFee: {
      type: Number,
      default: 600, // NEW: Flat ₹600 fee
    },
    address: {
      street: {
        type: String,
        required: [true, 'Please add a street address'],
      },
      city: {
        type: String,
        required: [true, 'Please add a city'],
      },
      state: {
        type: String,
        required: [true, 'Please add a state'],
      },
      zipCode: {
        type: String,
        required: [true, 'Please add a zip code'],
      },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },
    propertyType: {
      type: String,
      required: [true, 'Please add a property type'],
      enum: ['house', 'apartment', 'villa', 'plot', 'commercial'],
    },
    listingType: {
      type: String,
      required: [true, 'Please specify if property is for sale or rent'],
      enum: ['sale', 'rent'],
    },
    listedBy: {
      type: String,
      required: true,
      enum: ['broker', 'owner'],
      default: 'owner', // NEW FIELD
    },
    area: {
      type: Number,
      required: [true, 'Please add property area'],
      min: [0, 'Area cannot be negative'],
    },
    bedrooms: {
      type: Number,
      min: [0, 'Bedrooms cannot be negative'],
    },
    bathrooms: {
      type: Number,
      min: [0, 'Bathrooms cannot be negative'],
    },
    images: {
      type: [String],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10; // Max 10 images
        },
        message: 'Cannot upload more than 10 images',
      },
    },
    amenities: [String],
    status: {
      type: String,
      enum: ['available', 'sold', 'rented', 'pending'],
      default: 'available',
    },
    seller: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for location-based queries
propertySchema.index({ 'address.city': 1, 'address.state': 1 });

export default mongoose.model<IProperty>('Property', propertySchema);