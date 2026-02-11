import { Response } from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import Payment from '../models/Payment';
import Broker from '../models/Broker';

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// @desc    Create payment order with 1.25% commission split
// @route   POST /api/v1/payments/create-order
// @access  Private (Broker)
export const createPaymentOrder = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const { propertyType, saleAmount } = req.body;

    // Validate input
    if (!propertyType || !saleAmount || saleAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Property type and valid sale amount are required',
      });
    }

    if (!['residential', 'commercial'].includes(propertyType)) {
      return res.status(400).json({
        success: false,
        message: 'Property type must be residential or commercial',
      });
    }

    // Find broker
    const broker = await Broker.findOne({ user: req.user._id }).populate('user');

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    // Calculate 1.25% commission
    const commissionRate = 1.25;
    const totalCommission = Math.round((saleAmount * commissionRate) / 100);

    // Split commission: 45% broker, 55% platform
    const brokerShare = Math.round(totalCommission * 0.45);
    const platformShare = Math.round(totalCommission * 0.55);

    console.log('💰 Creating payment order:');
    console.log('  Property Type:', propertyType);
    console.log('  Sale Amount:', saleAmount);
    console.log('  Commission Rate:', commissionRate + '%');
    console.log('  Total Commission (1.25%):', totalCommission);
    console.log('  Broker Share (45% of commission):', brokerShare);
    console.log('  Platform Share (55% of commission):', platformShare);

    // Create Razorpay order for ONLY the commission amount
    const razorpayOrder = await razorpay.orders.create({
      amount: totalCommission * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        propertyType: propertyType,
        saleAmount: saleAmount.toString(),
        commissionRate: commissionRate.toString(),
        brokerId: broker._id.toString(),
        brokerShare: brokerShare.toString(),
        platformShare: platformShare.toString(),
      },
    });

    // Create payment record
    const payment = await Payment.create({
      broker: broker._id,
      propertyType,
      saleAmount,
      commissionRate,
      totalCommission,
      brokerShare,
      platformShare,
      razorpayOrderId: razorpayOrder.id,
      paymentStatus: 'pending',
    });

    console.log('✅ Payment order created:', payment._id);

    res.status(201).json({
      success: true,
      data: {
        orderId: razorpayOrder.id,
        amount: totalCommission, // Only commission amount
        saleAmount,
        commissionRate,
        totalCommission,
        brokerShare,
        platformShare,
        currency: 'INR',
        paymentId: payment._id,
      },
    });
  } catch (error: any) {
    console.error('❌ Create payment order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify payment and mark as completed
// @route   POST /api/v1/payments/verify
// @access  Public
export const verifyPayment = async (req: any, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId, payerDetails } = req.body;

    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed - Invalid signature',
      });
    }

    // Update payment record
    const payment = await Payment.findById(paymentId);

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    payment.paymentStatus = 'completed';
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.payerName = payerDetails?.name;
    payment.payerPhone = payerDetails?.phone;
    payment.paymentDetails = {
      method: payerDetails?.method,
      completedAt: new Date(),
    };

    await payment.save();

    console.log('✅ Payment verified and completed:', payment._id);
    console.log('💸 Broker will receive:', payment.brokerShare);
    console.log('💸 Platform receives:', payment.platformShare);

    res.status(200).json({
      success: true,
      message: 'Payment successful! Commission has been recorded.',
      data: {
        paymentId: payment._id,
        totalCommission: payment.totalCommission,
        brokerShare: payment.brokerShare,
        platformShare: payment.platformShare,
      },
    });
  } catch (error: any) {
    console.error('❌ Verify payment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get broker's payment history
// @route   GET /api/v1/payments/broker-history
// @access  Private (Broker)
export const getBrokerPaymentHistory = async (req: any, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const broker = await Broker.findOne({ user: req.user._id });

    if (!broker) {
      return res.status(404).json({ success: false, message: 'Broker profile not found' });
    }

    const payments = await Payment.find({ broker: broker._id }).sort('-createdAt');

    const totalEarnings = payments
      .filter((p) => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + p.brokerShare, 0);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalEarnings,
        pendingPayments: payments.filter((p) => p.paymentStatus === 'pending').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all payments (Admin)
// @route   GET /api/v1/payments/all
// @access  Private (Admin)
export const getAllPayments = async (req: any, res: Response) => {
  try {
    const payments = await Payment.find()
      .populate('broker')
      .sort('-createdAt');

    const totalRevenue = payments
      .filter((p) => p.paymentStatus === 'completed')
      .reduce((sum, p) => sum + p.platformShare, 0);

    res.status(200).json({
      success: true,
      data: {
        payments,
        totalRevenue,
        totalPayments: payments.length,
        completedPayments: payments.filter((p) => p.paymentStatus === 'completed').length,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};