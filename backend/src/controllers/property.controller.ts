import { Response } from 'express';
import Property from '../models/Property';
import Broker from '../models/Broker';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: Upload base64 to Cloudinary
const uploadToCloudinary = async (base64Data: string, resourceType: 'image' | 'video') => {
  const result = await cloudinary.uploader.upload(base64Data, {
    resource_type: resourceType,
    folder: 'getroof',
    ...(resourceType === 'video' && {
      eager: [{ format: 'mp4' }],
      eager_async: false,
    }),
  });
  return result.secure_url;
};

// @desc    Upload house by owner (No payment required)
// @route   POST /api/v1/properties/upload-house
// @access  Private
export const uploadHouseByOwner = async (req: any, res: Response) => {
  try {
    console.log('🏠 Upload house request received');
    console.log('User:', req.user?.email);

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { title, description, price, address, propertyType, listingType, area, bedrooms, bathrooms, amenities, images, video, ownerPhone } = req.body;

    if (!title || !description || !price || !address || !propertyType || !listingType || !area) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    if (!address.pinCode || !/^\d{6}$/.test(address.pinCode)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 6-digit PIN code' });
    }

    let imageUrls: string[] = [];
    if (images && images.length > 0) {
      console.log(`📸 Uploading ${images.length} images to Cloudinary...`);
      imageUrls = await Promise.all(images.map((img: string) => uploadToCloudinary(img, 'image')));
      console.log('✅ Images uploaded');
    }

    let videoUrl: string | undefined;
    if (video) {
      console.log('🎬 Uploading video to Cloudinary...');
      videoUrl = await uploadToCloudinary(video, 'video');
      console.log('✅ Video uploaded:', videoUrl);
    }

    const property = await Property.create({
      seller: req.user._id,
      title, description,
      price: Number(price),
      address: { street: address.street, city: address.city, state: address.state, pinCode: address.pinCode },
      propertyType, listingType,
      area: Number(area),
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      amenities: amenities || [],
      images: imageUrls,
      video: videoUrl,
      ownerPhone: ownerPhone || undefined,
      status: 'active',
    });

    console.log('✅ Property created:', property._id);

    res.status(201).json({
      success: true,
      message: 'Property uploaded successfully!',
      data: property,
    });
  } catch (error: any) {
    console.error('❌ Upload house error:', error);
    res.status(400).json({ success: false, message: error.message || 'Failed to upload property' });
  }
};

// @desc    Create new property (by brokers/admins)
// @route   POST /api/v1/properties
// @access  Private (Broker/Admin)
export const createProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    req.body.seller = req.user._id;

    if (req.user.role === 'broker') {
      req.body.listedBy = 'broker';
      const broker = await Broker.findOne({ user: req.user._id });
      if (broker) req.body.listedByBroker = broker._id;
    } else {
      req.body.listedBy = 'owner';
    }

    const property = await Property.create(req.body);
    res.status(201).json({ success: true, data: property });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Get all properties with optional text search across address fields
// @route   GET /api/v1/properties
// @access  Public
export const getAllProperties = async (req: any, res: Response) => {
  try {
    const { listingType, minPrice, maxPrice, pinCode, propertyType, search } = req.query;

    const query: any = {};

    // ── Text search across all address fields ──────────────────────────────
    if (search && search.trim()) {
      const searchTerm = search.trim();
      // If it looks like a PIN code (6 digits) search only pinCode for precision
      if (/^\d{6}$/.test(searchTerm)) {
        query['address.pinCode'] = searchTerm;
      } else {
        // Search across street, city, state, pinCode with case-insensitive regex
        query.$or = [
          { 'address.street': { $regex: searchTerm, $options: 'i' } },
          { 'address.city': { $regex: searchTerm, $options: 'i' } },
          { 'address.state': { $regex: searchTerm, $options: 'i' } },
          { 'address.pinCode': { $regex: searchTerm, $options: 'i' } },
          { title: { $regex: searchTerm, $options: 'i' } },
        ];
      }
    } else if (pinCode) {
      // Legacy pinCode param still supported
      query['address.pinCode'] = pinCode;
    }

    if (listingType) query.listingType = listingType;
    if (propertyType) query.propertyType = propertyType;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (listingType === 'rent') {
      query.status = { $in: ['active', 'rented'] };
    } else {
      query.status = 'active';
    }

    const properties = await Property.find(query)
      .populate('seller', 'name email phone')
      .sort({ status: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Search properties by multiple PIN codes
// @route   POST /api/v1/properties/search-by-pincodes
// @access  Public
export const searchByPinCodes = async (req: any, res: Response) => {
  try {
    const { pinCodes, listingType } = req.body;

    if (!pinCodes || !Array.isArray(pinCodes) || pinCodes.length === 0) {
      return res.status(400).json({ success: false, message: 'Please provide PIN codes array' });
    }

    const query: any = {
      'address.pinCode': { $in: pinCodes },
    };

    if (listingType === 'rent') {
      query.status = { $in: ['active', 'rented'] };
    } else {
      query.status = 'active';
    }

    if (listingType) query.listingType = listingType;

    const properties = await Property.find(query)
      .populate('seller', 'name email phone')
      .sort({ status: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark rental property as rented
// @route   PATCH /api/v1/properties/:id/mark-rented
// @access  Private (Owner only)
export const markAsRented = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    if (property.listingType !== 'rent') {
      return res.status(400).json({ success: false, message: 'Only rental properties can be marked as rented' });
    }

    property.status = property.status === 'rented' ? 'active' : 'rented';
    await property.save();

    res.status(200).json({
      success: true,
      message: property.status === 'rented' ? 'Property marked as rented!' : 'Property marked as available!',
      data: property,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Public
export const getProperty = async (req: any, res: Response) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('seller', 'name email phone')
      .populate({
        path: 'listedByBroker',
        populate: { path: 'user', select: 'name email profilePicture' },
      });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private
export const updateProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to update this property' });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

    res.status(200).json({ success: true, data: property });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private
export const deleteProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this property' });
    }

    await property.deleteOne();

    res.status(200).json({ success: true, data: {} });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's properties
// @route   GET /api/v1/properties/my-properties
// @access  Private
export const getMyProperties = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const properties = await Property.find({ seller: req.user._id }).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload property images
// @route   POST /api/v1/properties/:id/images
// @access  Private
export const uploadPropertyImages = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Not authorized to upload images for this property' });
    }

    res.status(200).json({ success: true, message: 'Images uploaded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};