import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

const {
  registerBroker,
  getBrokerProfile,
  updateBrokerProfile,
  getBrokerProperties,
  getBrokerVisitRequests,
  checkBrokerStatus,
} = require('../controllers/broker.controller');


// Protected routes - any logged-in user can apply to be a broker
router.post('/register', protect, asyncHandler(registerBroker));
router.get('/check-status', protect, asyncHandler(checkBrokerStatus));

// Protected routes - only verified brokers
router.get('/profile', protect, authorize('broker', 'admin'), asyncHandler(getBrokerProfile));
router.put('/profile', protect, authorize('broker', 'admin'), asyncHandler(updateBrokerProfile));
router.get('/properties', protect, authorize('broker', 'admin'), asyncHandler(getBrokerProperties));
router.get('/visits', protect, authorize('broker', 'admin'), asyncHandler(getBrokerVisitRequests));

// @desc    Get my broker application
// @route   GET /api/v1/brokers/my-application
// @access  Private

export default router;