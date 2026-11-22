import asyncHandler from '../utils/asyncHandler.js';
import * as authService from '../services/authService.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  // Le controller ne fait que passer les données au service
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, ...data });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.json({ success: true, ...data });
});