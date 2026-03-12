import { Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import Payment from '../models/Payment';
import Broker from '../models/Broker';
import Property from '../models/Property';

const CASHFREE_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://api.cashfree.com/pg'
  : 'https://sandbox.cashfree.com/pg';

const cashfreeHeaders = {
  'x-api-version': '2023-08-01',
  'x-client-id': process.env.CASHFREE_APP_ID!,
  'x-client-secret': process.env.CASHFREE_SECRET_KEY!,
  'Content-Type': 'application/json',
};

// @desc    Create Cashfree QR code for commission payment
// @route   POST /api/v1/payments/create-qr
// @access  Private (Broker)
export const createPaymentQR = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const { propertyType, saleAmount, notificationId, propertyId } = req.body;

    if (!propertyType || !saleAmount || saleAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Property type and valid sale amount are required' });
    }

    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker profile not found' });

    // Calculate 1.49% commission
    const totalCommission = Math.round((saleAmount * 1.49) / 100);
    const brokerShare = Math.round(totalCommission * 0.70);
    const platformShare = Math.round(totalCommission * 0.30);

    // Create Cashfree order
    const orderId = `order_${Date.now()}_${broker._id.toString().slice(-6)}`;

    const orderResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders`,
      {
        order_id: orderId,
        order_amount: totalCommission,
        order_currency: 'INR',
        customer_details: {
          customer_id: `broker_${broker._id}`,
          customer_name: req.user.name || 'Broker',
          customer_email: req.user.email || 'broker@getroof.in',
          customer_phone: req.user.phone || '9999999999',
        },
        order_meta: {
          return_url: `${process.env.FRONTEND_URL}/broker/payment-history`,
        },
        order_note: `Commission for property sale of ₹${saleAmount}`,
      },
      { headers: cashfreeHeaders }
    );

    const cfOrderId = orderResponse.data.order_id;

    // Generate QR code for this order
    const qrResponse = await axios.post(
      `${CASHFREE_BASE_URL}/orders/${cfOrderId}/payments/qrcode`,
      {},
      { headers: cashfreeHeaders }
    );

    const qrCodeUrl = qrResponse.data.link_url || qrResponse.data.payload;

    // Save payment record
    const payment = await Payment.create({
      broker: broker._id,
      propertyType,
      saleAmount,
      commissionRate: 1.49,
      totalCommission,
      brokerShare,
      platformShare,
      cashfreeOrderId: cfOrderId,
      paymentStatus: 'pending',
      propertyId: propertyId || null,
      notificationId: notificationId || null,
    });

    res.status(201).json({
      success: true,
      data: {
        qrCode: qrCodeUrl,
        totalCommission,
        brokerShare,
        platformShare,
        paymentId: payment._id,
        cfOrderId,
        saleAmount,
      },
    });
  } catch (error: any) {
    console.error('❌ Create QR error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.response?.data?.message || error.message });
  }
};

// @desc    Check if QR payment is completed
// @route   POST /api/v1/payments/check-qr-payment
// @access  Private (Broker)
export const checkQRPayment = async (req: any, res: Response) => {
  try {
    const { paymentId, cfOrderId } = req.body;

    // Check order status with Cashfree
    const orderResponse = await axios.get(
      `${CASHFREE_BASE_URL}/orders/${cfOrderId}`,
      { headers: cashfreeHeaders }
    );

    const orderStatus = orderResponse.data.order_status;
    const paid = orderStatus === 'PAID';

    if (paid) {
      // Update payment record
      const payment = await Payment.findById(paymentId);
      if (payment) {
        payment.paymentStatus = 'completed';
        payment.cashfreePaymentId = orderResponse.data.cf_order_id;
        await payment.save();

        // Mark property as sold if propertyId exists
        if (payment.propertyId) {
          await Property.findByIdAndUpdate(payment.propertyId, { status: 'sold' });
        }

        // Update broker total earnings
        await Broker.findByIdAndUpdate(payment.broker, {
          $inc: { totalEarnings: payment.brokerShare },
        });
      }
    }

    res.status(200).json({
      success: true,
      data: { paid, orderStatus },
    });
  } catch (error: any) {
    console.error('❌ Check payment error:', error.response?.data || error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create payment order (legacy Razorpay - keeping for backward compat)
// @route   POST /api/v1/payments/create-order
// @access  Private (Broker)
export const createPaymentOrder = async (req: any, res: Response) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Please use /create-qr endpoint for new payments' 
  });
};

// @desc    Verify payment (legacy)
// @route   POST /api/v1/payments/verify
export const verifyPayment = async (req: any, res: Response) => {
  return res.status(400).json({ 
    success: false, 
    message: 'Please use /check-qr-payment endpoint' 
  });
};

// @desc    Get broker's payment history
// @route   GET /api/v1/payments/broker-history
// @access  Private (Broker)
export const getBrokerPaymentHistory = async (req: any, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker profile not found' });

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
    const payments = await Payment.find().populate('broker').sort('-createdAt');

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