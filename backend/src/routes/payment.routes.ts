import express from 'express';
import {
  createPaymentQR,
  checkQRPayment,
  createPaymentOrder,
  verifyPayment,
  getBrokerPaymentHistory,
  getAllPayments,
} from '../controllers/payment.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

const router = express.Router();

// NEW Cashfree QR routes
router.post('/create-qr', protect, authorize('broker', 'admin'), asyncHandler(createPaymentQR));
router.post('/check-qr-payment', protect, authorize('broker', 'admin'), asyncHandler(checkQRPayment));

// Broker routes
router.post('/create-order', protect, authorize('broker', 'admin'), asyncHandler(createPaymentOrder));
router.get('/broker-history', protect, authorize('broker', 'admin'), asyncHandler(getBrokerPaymentHistory));

// Public route for payment verification
router.post('/verify', asyncHandler(verifyPayment));

// Admin routes
router.get('/all', protect, authorize('admin'), asyncHandler(getAllPayments));

export default router;