import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware';
import {
  savePaymentMethod,
  getPaymentMethod,
  requestWithdrawal,
  getMyWithdrawals,
  getAllWithdrawals,
  updateWithdrawalStatus,
} from '../controllers/withdrawal.controller';

const router = express.Router();

// Broker routes
router.post('/payment-method', protect, authorize('broker'), savePaymentMethod);
router.get('/payment-method', protect, authorize('broker'), getPaymentMethod);
router.post('/request', protect, authorize('broker'), requestWithdrawal);
router.get('/my', protect, authorize('broker'), getMyWithdrawals);

// Admin routes
router.get('/admin/all', protect, authorize('admin'), getAllWithdrawals);
router.put('/admin/:id', protect, authorize('admin'), updateWithdrawalStatus);

export default router;