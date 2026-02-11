import { Response } from 'express';
import Property from '../models/Property';
import Broker from '../models/Broker';

// @desc    Upload house by owner (No payment required)
// @route   POST /api/v1/properties/upload-house
// @access  Private
export const uploadHouseByOwner = async (req: any, res: Response) => {
  try {
    console.log('🏠 Upload house request received');
    console.log('User:', req.user?.email);
    console.log('Body:', req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const {
      title,
      description,
      price,
      address,
      propertyType,
      listingType,
      area,
      bedrooms,
      bathrooms,
      amenities,
      images,
    } = req.body;

    // Validate required fields
    if (!title || !description || !price || !address || !propertyType || !listingType || !area) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Validate PIN code
    if (!address.pinCode || !/^\d{6}$/.test(address.pinCode)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 6-digit PIN code',
      });
    }

    // Create property
    const property = await Property.create({
      seller: req.user._id,
      title,
      description,
      price: Number(price),
      address: {
        street: address.street,
        city: address.city,
        state: address.state,
        pinCode: address.pinCode,
      },
      propertyType,
      listingType,
      area: Number(area),
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      amenities: amenities || [],
      images: images || [],
      status: 'active',
    });

    console.log('✅ Property created:', property._id);
    console.log('📍 PIN Code:', property.address.pinCode);

    res.status(201).json({
      success: true,
      message: 'Property uploaded successfully!',
      data: property,
    });
  } catch (error: any) {
    console.error('❌ Upload house error:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Failed to upload property',
    });
  }
};

// @desc    Create new property (by brokers/admins)
// @route   POST /api/v1/properties
// @access  Private (Broker/Admin)
export const createProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Add user as seller
    req.body.seller = req.user._id;
    
    // If user is a broker, mark property as broker-listed
    if (req.user.role === 'broker') {
      req.body.listedBy = 'broker';
      
      // Find broker document for this user
      const broker = await Broker.findOne({ user: req.user._id });
      if (broker) {
        req.body.listedByBroker = broker._id;
      }
    } else {
      req.body.listedBy = 'owner';
    }

    const property = await Property.create(req.body);

    res.status(201).json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all properties (with PIN code filter)
// @route   GET /api/v1/properties
// @access  Public
export const getAllProperties = async (req: any, res: Response) => {
  try {
    const { listingType, minPrice, maxPrice, pinCode, propertyType } = req.query;

    const query: any = { status: 'active' };

    // Filter by PIN code
    if (pinCode) {
      query['address.pinCode'] = pinCode;
    }

    // Filter by listing type
    if (listingType) {
      query.listingType = listingType;
    }

    // Filter by property type
    if (propertyType) {
      query.propertyType = propertyType;
    }

    // Filter by price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    console.log('🔍 Property search query:', query);

    const properties = await Property.find(query)
      .populate('seller', 'name email phone')
      .sort('-createdAt');

    console.log(`✅ Found ${properties.length} properties`);

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    console.error('❌ Get properties error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// @desc    Search properties by multiple PIN codes
// @route   POST /api/v1/properties/search-by-pincodes
// @access  Public
export const searchByPinCodes = async (req: any, res: Response) => {
  try {
    const { pinCodes, listingType } = req.body;

    if (!pinCodes || !Array.isArray(pinCodes) || pinCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide PIN codes array',
      });
    }

    const query: any = {
      status: 'active',
      'address.pinCode': { $in: pinCodes },
    };

    if (listingType) {
      query.listingType = listingType;
    }

    const properties = await Property.find(query)
      .populate('seller', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single property
// @route   GET /api/v1/properties/:id
// @access  Public
export const getProperty = async (req: any, res: Response) => {
  try {
    const property = await Property.findById(req.params.id).populate(
      'seller',
      'name email phone'
    );

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update property
// @route   PUT /api/v1/properties/:id
// @access  Private (Broker/Admin)
export const updateProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    let property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Make sure user is property owner or admin
    const sellerId = property.seller.toString();
    const userId = req.user._id.toString();
    
    if (sellerId !== userId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this property',
      });
    }

    property = await Property.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete property
// @route   DELETE /api/v1/properties/:id
// @access  Private (Broker/Admin)
export const deleteProperty = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Make sure user is property owner or admin
    const sellerId = property.seller.toString();
    const userId = req.user._id.toString();
    
    if (sellerId !== userId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this property',
      });
    }

    await property.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Upload property images
// @route   POST /api/v1/properties/:id/images
// @access  Private (Broker/Admin)
export const uploadPropertyImages = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    // Make sure user is property owner or admin
    const sellerId = property.seller.toString();
    const userId = req.user._id.toString();
    
    if (sellerId !== userId && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to upload images for this property',
      });
    }

    // Handle file upload logic here
    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// @desc    Get user's properties
// @route   GET /api/v1/properties/my-properties
// @access  Private
export const getMyProperties = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const properties = await Property.find({ seller: req.user._id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: properties.length,
      data: properties,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};