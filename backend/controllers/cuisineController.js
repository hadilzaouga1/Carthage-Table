import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/cuisineService.js';

// GET /api/cuisines (public)
export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, cuisines: await service.listCuisines() });
});

// POST /api/cuisines (admin)
export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, cuisine: await service.createCuisine(req.body) });
});

// PUT /api/cuisines/:id (admin)
export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, cuisine: await service.updateCuisine(req.params.id, req.body) });
});

// DELETE /api/cuisines/:id (admin, refusée si la cuisine est utilisée)
export const remove = asyncHandler(async (req, res) => {
  await service.deleteCuisine(req.params.id);
  res.json({ success: true, message: 'Cuisine supprimée' });
});
