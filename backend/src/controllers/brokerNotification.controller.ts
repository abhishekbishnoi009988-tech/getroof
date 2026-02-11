import { Response } from 'express';
import BrokerNotification from '../models/BrokerNotification';
import Broker from '../models/Broker';

// @desc    Get broker's notifications
// @route   GET /api/v1/broker-notifications
// @access  Private (Broker)
export const getBrokerNotifications = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Find broker by user ID
    const broker = await Broker.findOne({ user: req.user._id });

    if (!broker) {
      return res.status(404).json({
        success: false,
        message: 'Broker profile not found',
      });
    }

    // Get all notifications for this broker
    const notifications = await BrokerNotification.find({ broker: broker._id })
      .populate('property')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (error: any) {
    console.error('Get broker notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update notification status
// @route   PATCH /api/v1/broker-notifications/:id
// @access  Private (Broker)
export const updateNotificationStatus = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized',
      });
    }

    const notification = await BrokerNotification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    // Find broker
    const broker = await Broker.findOne({ user: req.user._id });

    if (!broker || notification.broker.toString() !== broker._id.toString()) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this notification',
      });
    }

    // Update status
    if (req.body.status) {
      notification.status = req.body.status;
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error: any) {
    console.error('Update notification status error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread notification count for broker
// @route   GET /api/v1/broker-notifications/unread-count
// @access  Private/Broker
export const getUnreadCount = async (req: any, res: Response) => {
  try {
    console.log('🔍 Getting unread count for user:', req.user?._id);

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized - user not found',
      });
    }

    // Find broker by user ID (not req.user.brokerId!)
    const broker = await Broker.findOne({ user: req.user._id });

    if (!broker) {
      console.log('⚠️ No broker profile found for user:', req.user._id);
      return res.status(200).json({
        success: true,
        count: 0, // Return 0 instead of error if no broker profile
      });
    }

    console.log('✅ Broker found:', broker._id);

    // Count unread notifications
    const unreadCount = await BrokerNotification.countDocuments({
      broker: broker._id,
      status: 'pending',
    });

    console.log(`✅ Unread notifications for broker ${broker._id}: ${unreadCount}`);

    res.status(200).json({
      success: true,
      count: unreadCount,
    });
  } catch (error: any) {
    console.error('❌ Get unread count error:', error.message);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};