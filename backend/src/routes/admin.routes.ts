import express, { Request, Response } from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import Broker from '../models/Broker';
import User from '../models/User';
import {
  getAllUsers,
  updateUser,
  deleteUser,
  getAllBrokers,
  verifyBroker,  // ← Only this one
  getAllProperties,
  getAllVisitRequests,
  } from '../controllers/admin.controller';

const router = express.Router();

// @desc    Get all broker applications
// @route   GET /api/v1/admin/brokers
// @access  Private/Admin
router.get(
  '/brokers',
  protect,
  authorize('admin'),
  asyncHandler(async (req: any, res: Response) => {
    const brokers = await Broker.find()
      .populate('user', 'name email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: brokers.length,
      data: brokers,
    });
  })
);

// @desc    Verify/Reject broker application
// @route   PUT /api/v1/admin/brokers/:id/verify
// @access  Private/Admin
router.put(
  '/brokers/:id/verify',
  protect,
  authorize('admin'),
  asyncHandler(async (req: any, res: Response) => {
    const { verificationStatus } = req.body;

    if (!['verified', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification status',
      });
    }

    const broker = await Broker.findById(req.params.id);

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker not found',
      });
    }

    broker.verificationStatus = verificationStatus;
    await broker.save();

    // If verified, update user role to broker
    if (verificationStatus === 'verified') {
      await User.findByIdAndUpdate(broker.user, { role: 'broker' });
    }

    res.status(200).json({
      success: true,
      message: `Broker ${verificationStatus} successfully`,
      data: broker,
    });
  })
);

export default router;