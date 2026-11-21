import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/restaurantService.js';

// GET /api/restaurants
export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await service.listRestaurants(req.query)) });
});

// GET /api/restaurants/:id
export const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, restaurant: await service.getRestaurant(req.params.id) });
});

// GET /api/restaurants/mine
export const mine = asyncHandler(async (req, res) => {
  res.json({ success: true, restaurants: await service.getMyRestaurants(req.user) });
});

// POST /api/restaurants
export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, restaurant: await service.createRestaurant(req.user, req.body) });
});

// PUT /api/restaurants/:id
export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, restaurant: await service.updateRestaurant(req.user, req.params.id, req.body) });
});

// DELETE /api/restaurants/:id
export const remove = asyncHandler(async (req, res) => {
  await service.deleteRestaurant(req.user, req.params.id);
  res.json({ success: true, message: 'Restaurant supprimé' });
});