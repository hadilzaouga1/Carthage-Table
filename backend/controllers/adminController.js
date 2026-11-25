import asyncHandler from '../utils/asyncHandler.js';
import * as adminService from '../services/adminService.js';

// GET /api/admin/stats
export const stats = asyncHandler(async (req, res) => {
  res.json({ success: true, stats: await adminService.getStats() });
});

// GET /api/admin/orders/today
export const todayOrders = asyncHandler(async (req, res) => {
  res.json({ success: true, data: await adminService.getTodayOrders() });
});