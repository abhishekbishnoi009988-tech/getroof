import express from 'express';
import { toggleWishlist, getWishlist, checkWishlist, getWishlistIds } from '../controllers/wishlist.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

router.use(protect); // all wishlist routes require login

router.post('/toggle/:propertyId', toggleWishlist);
router.get('/', getWishlist);
router.get('/ids', getWishlistIds);
router.get('/check/:propertyId', checkWishlist);

export default router;