import { Response } from 'express';
import Wishlist from '../models/Wishlist';
import Property from '../models/Property';

// @desc    Toggle wishlist (add or remove)
// @route   POST /api/v1/wishlist/toggle/:propertyId
// @access  Private
export const toggleWishlist = async (req: any, res: Response) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const existing = await Wishlist.findOne({ user: userId, property: propertyId });

    if (existing) {
      await existing.deleteOne();
      return res.status(200).json({ success: true, saved: false, message: 'Removed from wishlist' });
    }

    await Wishlist.create({ user: userId, property: propertyId });
    res.status(201).json({ success: true, saved: true, message: 'Added to wishlist' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's wishlist
// @route   GET /api/v1/wishlist
// @access  Private
export const getWishlist = async (req: any, res: Response) => {
  try {
    const items = await Wishlist.find({ user: req.user._id })
      .populate({
        path: 'property',
        populate: { path: 'seller', select: 'name email' },
      })
      .sort('-createdAt');

    const properties = items
      .filter((item) => item.property) // filter deleted properties
      .map((item) => item.property);

    res.status(200).json({ success: true, count: properties.length, data: properties });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if a property is in wishlist
// @route   GET /api/v1/wishlist/check/:propertyId
// @access  Private
export const checkWishlist = async (req: any, res: Response) => {
  try {
    const exists = await Wishlist.findOne({
      user: req.user._id,
      property: req.params.propertyId,
    });
    res.status(200).json({ success: true, saved: !!exists });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get wishlist property IDs only (for bulk check on list pages)
// @route   GET /api/v1/wishlist/ids
// @access  Private
export const getWishlistIds = async (req: any, res: Response) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).select('property');
    const ids = items.map((item) => item.property.toString());
    res.status(200).json({ success: true, data: ids });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};