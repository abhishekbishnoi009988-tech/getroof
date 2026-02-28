import { Response } from 'express';
import WithdrawalRequest from '../models/WithdrawalRequest';
import BrokerPaymentMethod from '../models/BrokerPaymentMethod';
import Broker from '../models/Broker';
import Payment from '../models/Payment';

// @desc    Save broker payment method (UPI or Bank)
// @route   POST /api/v1/withdrawals/payment-method
// @access  Private (Broker)
export const savePaymentMethod = async (req: any, res: Response) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker not found' });

    const { paymentMethod, upiId, bankDetails } = req.body;

    if (paymentMethod === 'upi' && !upiId) {
      return res.status(400).json({ success: false, message: 'UPI ID is required' });
    }
    if (paymentMethod === 'bank' && (!bankDetails?.accountNumber || !bankDetails?.ifscCode || !bankDetails?.accountHolderName || !bankDetails?.bankName)) {
      return res.status(400).json({ success: false, message: 'All bank details are required' });
    }

    const method = await BrokerPaymentMethod.findOneAndUpdate(
      { broker: broker._id },
      { broker: broker._id, paymentMethod, upiId: paymentMethod === 'upi' ? upiId : undefined, bankDetails: paymentMethod === 'bank' ? bankDetails : undefined },
      { upsert: true, new: true }
    );

    res.status(200).json({ success: true, message: 'Payment method saved!', data: method });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get broker payment method
// @route   GET /api/v1/withdrawals/payment-method
// @access  Private (Broker)
export const getPaymentMethod = async (req: any, res: Response) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker not found' });

    const method = await BrokerPaymentMethod.findOne({ broker: broker._id });
    res.status(200).json({ success: true, data: method });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Request withdrawal
// @route   POST /api/v1/withdrawals/request
// @access  Private (Broker)
export const requestWithdrawal = async (req: any, res: Response) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker not found' });

    const { amount } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is ₹100' });
    }

    // Get payment method
    const paymentMethod = await BrokerPaymentMethod.findOne({ broker: broker._id });
    if (!paymentMethod) {
      return res.status(400).json({ success: false, message: 'Please add a payment method first' });
    }

    // Calculate available balance
    const payments = await Payment.find({ broker: broker._id, paymentStatus: 'completed' });
    const totalEarned = payments.reduce((sum, p) => sum + p.brokerShare, 0);
    const previousWithdrawals = await WithdrawalRequest.find({
      broker: broker._id,
      status: { $in: ['approved', 'paid', 'pending'] }
    });
    const totalWithdrawn = previousWithdrawals.reduce((sum, w) => sum + w.amount, 0);
    const availableBalance = totalEarned - totalWithdrawn;

    if (amount > availableBalance) {
      return res.status(400).json({ success: false, message: `Insufficient balance. Available: ₹${availableBalance}` });
    }

    const withdrawal = await WithdrawalRequest.create({
      broker: broker._id,
      amount,
      paymentMethod: paymentMethod.paymentMethod,
      upiId: paymentMethod.upiId,
      bankDetails: paymentMethod.bankDetails,
    });

    res.status(201).json({ success: true, message: 'Withdrawal request submitted!', data: withdrawal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get broker withdrawal history + balance
// @route   GET /api/v1/withdrawals/my
// @access  Private (Broker)
export const getMyWithdrawals = async (req: any, res: Response) => {
  try {
    const broker = await Broker.findOne({ user: req.user._id });
    if (!broker) return res.status(404).json({ success: false, message: 'Broker not found' });

    const payments = await Payment.find({ broker: broker._id, paymentStatus: 'completed' });
    const totalEarned = payments.reduce((sum, p) => sum + p.brokerShare, 0);

    const withdrawals = await WithdrawalRequest.find({ broker: broker._id }).sort('-createdAt');
    const totalWithdrawn = withdrawals
      .filter(w => ['approved', 'paid', 'pending'].includes(w.status))
      .reduce((sum, w) => sum + w.amount, 0);

    const availableBalance = totalEarned - totalWithdrawn;

    res.status(200).json({
      success: true,
      data: { withdrawals, totalEarned, totalWithdrawn, availableBalance }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all withdrawal requests (Admin)
// @route   GET /api/v1/withdrawals/admin/all
// @access  Private (Admin)
export const getAllWithdrawals = async (req: any, res: Response) => {
  try {
    const withdrawals = await WithdrawalRequest.find()
      .populate({ path: 'broker', populate: { path: 'user', select: 'name email' } })
      .sort('-createdAt');

    res.status(200).json({ success: true, data: withdrawals });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update withdrawal status (Admin)
// @route   PUT /api/v1/withdrawals/admin/:id
// @access  Private (Admin)
export const updateWithdrawalStatus = async (req: any, res: Response) => {
  try {
    const { status, adminNote } = req.body;
    const withdrawal = await WithdrawalRequest.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate({ path: 'broker', populate: { path: 'user', select: 'name email' } });

    if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal not found' });

    res.status(200).json({ success: true, message: `Withdrawal ${status}`, data: withdrawal });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};