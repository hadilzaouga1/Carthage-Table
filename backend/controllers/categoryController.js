import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/categoryService.js';

export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: await service.listCategories(req.query) });
});

export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, category: await service.createCategory(req.user, req.body) });
});

export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, category: await service.updateCategory(req.user, req.params.id, req.body) });
});

export const remove = asyncHandler(async (req, res) => {
  await service.deleteCategory(req.user, req.params.id);
  res.json({ success: true, message: 'Catégorie supprimée' });
});