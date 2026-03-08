import { Response } from 'express';
import Property from '../models/Property';
import BrokerNotification from '../models/BrokerNotification';
import Broker from '../models/Broker';

// @desc    Get brokers by PIN code
// @route   GET /api/v1/buyer-interests/brokers-by-pincode/:pinCode
// @access  Public
export const getBrokersByPinCode = async (req: any, res: Response) => {
  try {
    const { pinCode } = req.params;

    if (!pinCode) {
      return res.status(400).json({
        success: false,
        message: 'PIN code is required',
      });
    }

    // Find verified brokers who service this PIN code
    const brokers = await Broker.find({
      verificationStatus: 'verified',
      $or: [
        { servicePinCodes: pinCode },
        { 'officeLocation.pinCode': pinCode },
      ],
    })
      .populate('user', 'name email profilePicture')
      .select('user specialization yearsOfExperience description officeLocation servicePinCodes');

    // If no brokers found in that PIN code, return all verified brokers
    let finalBrokers = brokers;
    if (brokers.length === 0) {
      finalBrokers = await Broker.find({ verificationStatus: 'verified' })
        .populate('user', 'name email profilePicture')
        .select('user specialization yearsOfExperience description officeLocation servicePinCodes')
        .limit(5);
    }

    res.status(200).json({
      success: true,
      count: finalBrokers.length,
      data: finalBrokers,
    });
  } catch (error: any) {
    console.error('❌ Get brokers by PIN code error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch brokers',
    });
  }
};

// @desc    Create buyer interest - send to selected broker only
// @route   POST /api/v1/buyer-interests
// @access  Public
export const createBuyerInterest = async (req: any, res: Response) => {
  try {
    const { propertyId, phone, message, buyerName, brokerId } = req.body;

    console.log('📞 Buyer interest received:', { propertyId, phone, buyerName, brokerId });

    if (!propertyId || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Property ID and phone number are required',
      });
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number',
      });
    }

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found',
      });
    }

    console.log('🏠 Property found:', property.title);

    let targetBrokers = [];

    if (brokerId) {
      // Buyer selected a specific broker
      const broker = await Broker.findById(brokerId);
      if (!broker) {
        return res.status(404).json({
          success: false,
          message: 'Selected broker not found',
        });
      }
      targetBrokers = [broker];
      console.log('✅ Sending to selected broker:', broker._id);
    } else {
      // Fallback: send to all verified brokers
      targetBrokers = await Broker.find({ verificationStatus: 'verified' }).limit(5);
      console.log(`✅ Sending to ${targetBrokers.length} verified brokers`);
    }

    if (targetBrokers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Your interest has been recorded. We will contact you soon!',
      });
    }

    // Create notifications
    const notifications = await Promise.all(
      targetBrokers.map((broker: any) =>
        BrokerNotification.create({
          broker: broker._id,
          property: propertyId,
          buyerPhone: phone,
          buyerName: buyerName || 'Anonymous Buyer',
          message: message || 'Buyer is interested in this property',
          status: 'pending',
        })
      )
    );

    console.log(`✅ Created ${notifications.length} notifications`);

    res.status(201).json({
      success: true,
      message: brokerId
        ? 'Your details have been sent to the selected broker. They will contact you soon!'
        : `Your interest has been sent to ${targetBrokers.length} broker(s). They will contact you soon!`,
    });
  } catch (error: any) {
    console.error('❌ Create buyer interest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit interest',
    });
  }
};