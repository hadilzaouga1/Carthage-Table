import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/orderService.js';

// POST /api/orders
export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, order: await service.createOrder(req.user, req.body) });
});

// GET /api/orders/my-orders
export const myOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, orders: await service.listMyOrders(req.user) });
});

// GET /api/orders/restaurant
export const restaurantOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, orders: await service.listRestaurantOrders(req.user, req.query) });
});

// GET /api/orders/stats
export const stats = asyncHandler(async (req, res) => {
  res.json({ success: true, stats: await service.getStats(req.user) });
});

// GET /api/orders/:id
export const getOne = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await service.getOrder(req.user, req.params.id) });
});

// PUT /api/orders/:id/status
export const updateStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, order: await service.updateStatus(req.user, req.params.id, req.body.statut) });
});