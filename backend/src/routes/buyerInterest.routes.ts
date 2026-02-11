import express from 'express';
import { createBuyerInterest } from '../controllers/buyerInterest.controller';

const router = express.Router();

router.post('/', createBuyerInterest);

export default router;