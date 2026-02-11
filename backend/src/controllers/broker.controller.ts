import { Response } from 'express';
import Broker from '../models/Broker';
import User from '../models/User';

// @desc    Register as broker
// @route   POST /api/v1/brokers/register
// @access  Private
export const registerBroker = async (req: any, res: Response) => {
  try {
    console.log('📝 Broker registration request received');
    console.log('User:', req.user?.email);
    console.log('Body:', req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Check if user is already a broker
    const existingBroker = await Broker.findOne({ user: req.user._id });

    if (existingBroker) {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a broker',
      });
    }

    // Validate required fields
    const {
      licenseNumber,
      yearsOfExperience,
      specialization,
      description,
      officeLocation,
      servicePinCodes,
    } = req.body;

    if (!licenseNumber || !yearsOfExperience || !specialization || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    if (!officeLocation || !officeLocation.pinCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide office location with PIN code',
      });
    }

    if (!servicePinCodes || servicePinCodes.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one service PIN code',
      });
    }

    // Create broker
    const broker = await Broker.create({
      user: req.user._id,
      licenseNumber,
      yearsOfExperience: Number(yearsOfExperience),
      specialization,
      description,
      officeLocation,
      servicePinCodes,
      verificationStatus: 'pending',
    });

    console.log('✅ Broker created:', broker._id);
    console.log('📍 Office PIN code:', officeLocation.pinCode);
    console.log('📍 Service PIN codes:', servicePinCodes);

    // Update user role to broker
    await User.findByIdAndUpdate(req.user._id, { role: 'broker' });

    console.log('✅ User role updated to broker');

    res.status(201).json({
      success: true,
      message: 'Broker application submitted successfully. Please wait for admin verification.',
      data: broker,
    });
  } catch (error: any) {
    console.error('❌ Register broker error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to register broker',
    });
  }
};

// @desc    Get broker profile
// @route   GET /api/v1/brokers/profile
// @access  Private (Broker only)
export const getBrokerProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const broker = await Broker.findOne({ user: req.user._id }).populate(
      'user',
      'name email phone profilePicture'
    );

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found. Please complete broker registration.',
      });
    }

    res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update broker profile
// @route   PUT /api/v1/brokers/profile
// @access  Private (Broker)
export const updateBrokerProfile = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const broker = await Broker.findOneAndUpdate(
      { user: req.user._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: broker,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get broker's properties
// @route   GET /api/v1/brokers/properties
// @access  Private (Broker)
export const getBrokerProperties = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const Property = require('../models/Property').default;
    
    const properties = await Property.find({ seller: req.user._id }).sort(
      '-createdAt'
    );

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

// @desc    Get broker's visit requests
// @route   GET /api/v1/brokers/visits
// @access  Private (Broker)
export const getBrokerVisitRequests = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const Property = require('../models/Property').default;
    const VisitRequest = require('../models/VisitRequest').default;

    const properties = await Property.find({ seller: req.user._id });
    const propertyIds = properties.map((prop: any) => prop._id);

    const visitRequests = await VisitRequest.find({
      property: { $in: propertyIds },
    })
      .populate('property', 'title address')
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: visitRequests.length,
      data: visitRequests,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Check broker status
// @route   GET /api/v1/brokers/check-status
// @access  Private
export const checkBrokerStatus = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const broker = await Broker.findOne({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        isBroker: req.user.role === 'broker',
        hasApplication: !!broker,
        status: broker?.verificationStatus || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};