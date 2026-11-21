import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/dishService.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, dishes: await service.listDishes(req.query) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, dish: await service.createDish(req.user, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, dish: await service.updateDish(req.user, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteDish(req.user, req.params.id);
  res.json({ success: true, message: 'Plat supprimé' });
});