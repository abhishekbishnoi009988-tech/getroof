import express from 'express';
import { createBuyerInterest, getBrokersByPinCode } from '../controllers/buyerInterest.controller';

const router = express.Router();

// Get brokers by PIN code (public)
router.get('/brokers-by-pincode/:pinCode', getBrokersByPinCode);

// Create buyer interest
router.post('/', createBuyerInterest);

export default router;