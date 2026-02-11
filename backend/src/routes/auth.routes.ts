import express from 'express';
import passport from 'passport';
import { register, login, getMe, googleAuth  } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.post('/google', googleAuth);

router.get(
  '/google',
  (req, res, next) => {
    console.log('🔵 Google OAuth started');
    next();
  },
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  (req, res, next) => {
    console.log('🔵 Callback received');
    next();
  },
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=auth_failed`,
  }),
  (req: any, res) => {
    try {
      console.log('🔵 User:', req.user?.email);
      
      if (!req.user) {
        console.error('❌ No user');
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_user`);
      }

      const token = jwt.sign(
  { id: req.user._id.toString() },
  process.env.JWT_SECRET as string,
  { expiresIn: '30d' }
);
      
      console.log('✅ Token created');
      console.log('✅ Redirecting to:', `${process.env.FRONTEND_URL}/auth/callback`);
      
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error) {
      console.error('❌ Error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=token_failed`);
    }
  }
);

export default router;