import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

const {
  createProperty,
  getAllProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  uploadPropertyImages,
  uploadHouseByOwner,
  getMyProperties,
  searchByPinCodes,
} = require('../controllers/property.controller');

// Public routes
router.get('/', asyncHandler(getAllProperties));

// Protected routes - IMPORTANT: Specific routes BEFORE dynamic /:id
router.get('/my-properties', protect, asyncHandler(getMyProperties));
router.post('/upload-house', protect, asyncHandler(uploadHouseByOwner));

// Dynamic route - MUST BE LAST
router.get('/:id', asyncHandler(getProperty));

// Broker/Admin routes
router.post('/', protect, authorize('broker', 'admin'), asyncHandler(createProperty));
router.put('/:id', protect, authorize('broker', 'admin'), asyncHandler(updateProperty));
router.delete('/:id', protect, authorize('broker', 'admin'), asyncHandler(deleteProperty));
router.post('/:id/images', protect, authorize('broker', 'admin'), asyncHandler(uploadPropertyImages));
router.post('/search-by-pincodes', asyncHandler(searchByPinCodes));

export default router;