import asyncHandler from '../utils/asyncHandler.js';
import * as service from '../services/categoryService.js';

// GET /api/categories?restaurant=ID
export const list = asyncHandler(async (req, res) => {
  res.json({ success: true, categories: await service.listCategories(req.query) });
});

// POST /api/categories
export const create = asyncHandler(async (req, res) => {
  res.status(201).json({ success: true, category: await service.createCategory(req.user, req.body) });
});

// PUT /api/categories/:id
export const update = asyncHandler(async (req, res) => {
  res.json({ success: true, category: await service.updateCategory(req.user, req.params.id, req.body) });
});

// DELETE /api/categories/:id (refusée si elle contient encore des plats)
export const remove = asyncHandler(async (req, res) => {
  await service.deleteCategory(req.user, req.params.id);
  res.json({ success: true, message: 'Catégorie supprimée' });
});