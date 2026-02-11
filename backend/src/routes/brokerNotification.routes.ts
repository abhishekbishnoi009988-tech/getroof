import express from 'express';
import {
  getBrokerNotifications,
  getUnreadCount,
  updateNotificationStatus,
} from '../controllers/brokerNotification.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// This route is open to all authenticated users
router.get('/unread-count', getUnreadCount); // ← No role check

// These routes require broker role
router.get('/', authorize('broker', 'admin'), getBrokerNotifications);
router.patch('/:id', authorize('broker', 'admin'), updateNotificationStatus);

export default router;