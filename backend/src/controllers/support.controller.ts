import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import CallbackRequest from '../models/CallbackRequest';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

// @desc    Request a callback
// @route   POST /api/v1/support/callback
// @access  Public
export const requestCallback = async (req: Request, res: Response) => {
  try {
    const { phone, name, message } = req.body;

    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number' });
    }

    // Save to database
    const callbackRequest = await CallbackRequest.create({ phone, name, message });

    // Send email notification to support
    try {
      await transporter.sendMail({
        from: `"GETROOF Support" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER, // sends to your own email
        subject: '📞 New Callback Request — GETROOF',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #2563eb; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 22px;">📞 New Callback Request</h1>
            </div>
            <div style="background: #f8fafc; padding: 24px; border-radius: 0 0 10px 10px; border: 1px solid #e2e8f0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #475569; width: 120px;">Phone:</td>
                  <td style="padding: 10px;">
                    <a href="tel:${phone}" style="color: #2563eb; font-size: 18px; font-weight: bold;">${phone}</a>
                  </td>
                </tr>
                ${name ? `<tr><td style="padding: 10px; font-weight: bold; color: #475569;">Name:</td><td style="padding: 10px;">${name}</td></tr>` : ''}
                ${message ? `<tr><td style="padding: 10px; font-weight: bold; color: #475569;">Message:</td><td style="padding: 10px;">${message}</td></tr>` : ''}
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Time:</td>
                  <td style="padding: 10px;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</td>
                </tr>
                <tr>
                  <td style="padding: 10px; font-weight: bold; color: #475569;">Request ID:</td>
                  <td style="padding: 10px; color: #94a3b8; font-size: 12px;">${callbackRequest._id}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; padding: 16px; background: #eff6ff; border-radius: 8px; text-align: center;">
                <p style="margin: 0; color: #1e40af; font-weight: bold;">Call back within 24 hours</p>
                <a href="tel:${phone}" style="display: inline-block; margin-top: 12px; background: #2563eb; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">
                  📞 Call ${phone}
                </a>
              </div>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send callback email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Callback request submitted! Our team will call you within 24 hours.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all callback requests (Admin)
// @route   GET /api/v1/support/callbacks
// @access  Private (Admin)
export const getCallbackRequests = async (req: any, res: Response) => {
  try {
    const { status } = req.query;
    const query: any = {};
    if (status && status !== 'all') query.status = status;

    const requests = await CallbackRequest.find(query).sort('-createdAt');
    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update callback request status (Admin)
// @route   PUT /api/v1/support/callbacks/:id
// @access  Private (Admin)
export const updateCallbackStatus = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    if (!['pending', 'called', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const request = await CallbackRequest.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.status(200).json({ success: true, data: request });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};