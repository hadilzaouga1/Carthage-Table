import asyncHandler from '../utils/asyncHandler.js';
import * as reviewService from '../services/reviewService.js';

// GET /api/reviews/restaurant/:restaurantId
export const byRestaurant = asyncHandler(async (req, res) => {
  const data = await reviewService.listRestaurantReviews(req.params.restaurantId);
  res.json({ success: true, ...data });
});

// POST /api/reviews
export const createOrUpdate = asyncHandler(async (req, res) => {
  const data = await reviewService.upsertReview(req.user, req.body);
  res.status(201).json({ success: true, ...data });
});

// DELETE /api/reviews/:id
export const remove = asyncHandler(async (req, res) => {
  const data = await reviewService.deleteReview(req.user, req.params.id);
  res.json({ success: true, ...data });
});