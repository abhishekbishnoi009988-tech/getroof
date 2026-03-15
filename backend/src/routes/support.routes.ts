import express from 'express';
import { requestCallback, getCallbackRequests, updateCallbackStatus } from '../controllers/support.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public
router.post('/callback', requestCallback);

// Admin only
router.get('/callbacks', protect, authorize('admin'), getCallbackRequests);
router.put('/callbacks/:id', protect, authorize('admin'), updateCallbackStatus);

export default router;