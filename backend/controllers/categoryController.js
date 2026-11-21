import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import { loadManagedRestaurant, httpError } from '../utils/ownership.js';

// GET /api/categories?restaurant=ID
export const list = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.query.restaurant)) throw httpError(422, 'Paramètre "restaurant" invalide.');
    res.json({ success: true, items: await Category.find({ restaurant: req.query.restaurant }).sort({ createdAt: 1 }) });
  } catch (err) {
    next(err);
  }
};

// POST /api/categories
export const create = async (req, res, next) => {
  try {
    await loadManagedRestaurant(req.body.restaurant, req.user);
    const { nom, description, restaurant } = req.body;
    res.status(201).json({ success: true, category: await Category.create({ nom, description, restaurant }) });
  } catch (err) {
    next(err);
  }
};

async function loadCategory(id, user) {
  const category = await Category.findById(id);
  if (!category) throw httpError(404, 'Catégorie introuvable.');
  await loadManagedRestaurant(category.restaurant, user);
  return category;
}

// PUT /api/categories/:id
export const update = async (req, res, next) => {
  try {
    const category = await loadCategory(req.params.id, req.user);
    if (req.body.nom !== undefined) category.nom = req.body.nom;
    if (req.body.description !== undefined) category.description = req.body.description;
    await category.save();
    res.json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/categories/:id  (refusée si elle contient encore des plats)
export const remove = async (req, res, next) => {
  try {
    const category = await loadCategory(req.params.id, req.user);
    if (await Dish.exists({ categorie: category._id })) {
      throw httpError(409, 'Cette catégorie contient encore des plats. Déplacez-les ou supprimez-les d\'abord.');
    }
    await category.deleteOne();
    res.json({ success: true, message: 'Catégorie supprimée.' });
  } catch (err) {
    next(err);
  }
};
