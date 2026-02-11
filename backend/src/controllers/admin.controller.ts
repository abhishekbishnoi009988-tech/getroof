import { Response } from 'express';
import User from '../models/User';
import Broker from '../models/Broker';
import Property from '../models/Property';
import VisitRequest from '../models/VisitRequest';

// @desc    Get all users
// @route   GET /api/v1/admin/users
// @access  Private/Admin
export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/v1/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req: any, res: Response) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/v1/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

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

// @desc    Get all brokers
// @route   GET /api/v1/admin/brokers
// @access  Private/Admin
export const getAllBrokers = async (req: any, res: Response) => {
  try {
    const brokers = await Broker.find()
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Verify/Reject broker
// @route   PUT /api/v1/admin/brokers/:id/verify
// @access  Private/Admin
export const verifyBroker = async (req: any, res: Response) => {
  try {
    const { verificationStatus } = req.body;

    console.log('🔍 Admin verification request:', { 
      brokerId: req.params.id, 
      verificationStatus 
    });

    // Validate status
    if (!verificationStatus || !['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'verificationStatus must be either "verified" or "rejected"',
      });
    }

    // Use findByIdAndUpdate to bypass validation
    // This prevents PIN code validation from blocking approval
    const broker = await Broker.findByIdAndUpdate(
      req.params.id,
      { 
        verificationStatus,
        // If you want to set default PIN codes on approval:
        // ...(verificationStatus === 'verified' && { servicePinCodes: [] })
      },
      { 
        new: true,
        runValidators: false,  // ✅ CRITICAL: Skip validation
        strict: false          // ✅ Allow updating even if field doesn't exist
      }
    ).populate('user', 'name email');

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found',
      });
    }

    // If verified, update user role to broker
    if (verificationStatus === 'verified') {
      await User.findByIdAndUpdate(
        broker.user,
        { role: 'broker' },
        { runValidators: false }
      );
      console.log('✅ Broker approved and user role updated to broker');
    } else {
      console.log('❌ Broker application rejected');
    }

    res.status(200).json({
      success: true,
      message: `Broker ${verificationStatus === 'verified' ? 'approved' : 'rejected'} successfully`,
      data: broker,
    });
  } catch (error: any) {
    console.error('❌ Verify broker error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify broker',
    });
  }
};

// @desc    Get all properties
// @route   GET /api/v1/admin/properties
// @access  Private/Admin
export const getAllProperties = async (req: any, res: Response) => {
  try {
    const properties = await Property.find()
      .populate('seller', 'name email')
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

// @desc    Get all visit requests
// @route   GET /api/v1/admin/visits
// @access  Private/Admin
export const getAllVisitRequests = async (req: any, res: Response) => {
  try {
    const visitRequests = await VisitRequest.find()
      .populate('user', 'name email phone')
      .populate('property', 'title address')
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