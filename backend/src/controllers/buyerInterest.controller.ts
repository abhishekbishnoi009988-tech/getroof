import { Response } from 'express';
import Property from '../models/Property';
import BrokerNotification from '../models/BrokerNotification';
import Broker from '../models/Broker';

export const createBuyerInterest = async (req: any, res: Response) => {
  try {
    const { propertyId, phone, message, buyerName } = req.body;

    console.log('📞 Buyer interest received:', { propertyId, phone, buyerName });

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

    // Get all verified brokers (simplified - no location filtering for now)
    const brokers = await Broker.find({ verificationStatus: 'verified' }).limit(5);

    console.log(`✅ Found ${brokers.length} verified brokers`);

    if (brokers.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Your interest has been recorded. We will contact you soon!',
      });
    }

    // Create notifications
    const notifications = await Promise.all(
      brokers.map((broker) =>
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
      message: `Your interest has been sent to ${brokers.length} broker(s). They will contact you soon!`,
    });
  } catch (error: any) {
    console.error('❌ Create buyer interest error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit interest',
    });
  }
};