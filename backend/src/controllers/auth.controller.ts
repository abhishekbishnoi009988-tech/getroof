import { Response } from 'express';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import * as admin from 'firebase-admin';
import User from '../models/User';

// ── Firebase Admin SDK initialization ────────────────────────────────────────
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('✅ Firebase Admin SDK initialized');
  } catch (error) {
    console.error('❌ Firebase Admin SDK initialization failed:', error);
  }
}

// ── Gmail SMTP transporter ────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// ── Helper: Send verification email ──────────────────────────────────────────
const sendVerificationEmail = async (email: string, name: string, token: string) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  await transporter.sendMail({
    from: `"GETROOF" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Verify your GETROOF account',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #2563eb; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🏠 GETROOF</h1>
        </div>
        <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
          <h2 style="color: #1e293b;">Hi ${name}! 👋</h2>
          <p style="color: #475569; font-size: 16px;">Welcome to GETROOF! Please verify your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" 
               style="background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
              ✅ Verify Email Address
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 14px;">This link expires in 24 hours. If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">
            GETROOF · 145A Mahadev Nagar, Banar, Jodhpur, Rajasthan – 342027<br>
            <a href="https://getroof.in" style="color: #2563eb;">getroof.in</a>
          </p>
        </div>
      </div>
    `,
  });
};

// ── Helper: Send push notification via Firebase Admin SDK (V1 API) ────────────
export const sendPushNotification = async (fcmToken: string, title: string, body: string, data?: any) => {
  try {
    if (!fcmToken || !admin.apps.length) return;

    const message: admin.messaging.Message = {
      token: fcmToken,
      notification: { title, body },
      android: {
        notification: {
          icon: 'ic_notification',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
        },
      },
      webpush: {
        notification: {
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          requireInteraction: true,
        },
        fcmOptions: {
          link: process.env.FRONTEND_URL,
        },
      },
      data: data ? Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])) : {},
    };

    const response = await admin.messaging().send(message);
    console.log('✅ Push notification sent:', response);
  } catch (error: any) {
    // Don't crash if notification fails — just log it
    console.error('FCM notification error:', error?.message || error);
  }
};

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: any, res: Response) => {
  try {
    const { name, email, password, phone } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password, phone, isEmailVerified: false });

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {
      await sendVerificationEmail(email, name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Account created! Please check your email to verify your account.',
      data: { id: user._id, name: user.name, email: user.email, isEmailVerified: false },
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req: any, res: Response) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification link. Please register again.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! Welcome to GETROOF.',
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, isEmailVerified: true },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Resend verification email
// @route   POST /api/v1/auth/resend-verification
// @access  Public
export const resendVerification = async (req: any, res: Response) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ success: false, message: 'No account found with this email' });
    if (user.isEmailVerified) return res.status(400).json({ success: false, message: 'Email is already verified' });

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });
    await sendVerificationEmail(email, user.name, verificationToken);

    res.status(200).json({ success: true, message: 'Verification email sent! Please check your inbox.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: any, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.password) {
      return res.status(401).json({ success: false, message: 'This account was created with Google. Please use "Continue with Google" to login.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!user.isEmailVerified) {
      return res.status(401).json({
        success: false,
        message: 'Please verify your email before logging in. Check your inbox or request a new verification email.',
        needsVerification: true,
        email: user.email,
      });
    }

    const token = user.getSignedJwtToken();
    res.status(200).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: any, res: Response) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save FCM token for push notifications
// @route   POST /api/v1/auth/fcm-token
// @access  Private
export const saveFcmToken = async (req: any, res: Response) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ success: false, message: 'FCM token required' });

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.status(200).json({ success: true, message: 'FCM token saved' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
export const logout = async (req: any, res: Response) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: undefined });
  } catch (_) {}
  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

// @desc    Update user role
// @route   PUT /api/v1/auth/role
// @access  Private
export const updateUserRole = async (req: any, res: Response) => {
  try {
    const { role } = req.body;
    if (!['user', 'broker', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { role }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Google OAuth login/register (auto-verified)
// @route   POST /api/v1/auth/google
// @access  Public
export const googleAuth = async (req: any, res: Response) => {
  try {
    const { email, name, profilePicture } = req.body;
    if (!email || !name) return res.status(400).json({ success: false, message: 'Email and name are required' });

    let user = await User.findOne({ email });

    if (user) {
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
      }
    } else {
      user = await User.create({
        name, email, profilePicture, role: 'user',
        isEmailVerified: true,
      });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture },
    });
  } catch (error: any) {
    console.error('❌ Google auth error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCurrentUser = getMe;