import mongoose from 'mongoose';
import Dish from '../models/Dish.js';
import Category from '../models/Category.js';
import { loadManagedRestaurant, httpError } from '../utils/ownership.js';

const WRITABLE = ['nom', 'description', 'prix', 'image', 'icon', 'disponible', 'categorie'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// La catégorie doit appartenir au même restaurant que le plat
async function assertCategoryMatches(categoryId, restaurantId) {
  const category = await Category.findById(categoryId);
  if (!category || String(category.restaurant) !== String(restaurantId)) {
    throw httpError(422, "Cette catégorie n'appartient pas à ce restaurant.");
  }
}

// GET /api/dishes?restaurant=&categorie=&q=&page=1&limit=20
// Sans "page", on renvoie jusqu'à 200 plats (comportement historique) ; avec "page", la liste est paginée.
export const list = async (req, res, next) => {
  try {
    const { restaurant, categorie, q } = req.query;
    const filter = {};
    if (restaurant) {
      if (!mongoose.isValidObjectId(restaurant)) throw httpError(422, 'Paramètre "restaurant" invalide.');
      filter.restaurant = restaurant;
    }
    if (categorie) filter.categorie = categorie;
    if (q) filter.nom = { $regex: escapeRegex(String(q).trim()), $options: 'i' };

    const paginated = req.query.page !== undefined;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = paginated ? Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100) : 200;

    const [items, total] = await Promise.all([
      Dish.find(filter).sort({ nom: 1 }).skip((page - 1) * limit).limit(limit),
      Dish.countDocuments(filter)
    ]);
    res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
};

// POST /api/dishes
export const create = async (req, res, next) => {
  try {
    await loadManagedRestaurant(req.body.restaurant, req.user);
    await assertCategoryMatches(req.body.categorie, req.body.restaurant);
    const dish = await Dish.create({ ...pick(req.body, WRITABLE), restaurant: req.body.restaurant });
    res.status(201).json({ success: true, dish });
  } catch (err) {
    next(err);
  }
};

async function loadDish(id, user) {
  const dish = await Dish.findById(id);
  if (!dish) throw httpError(404, 'Plat introuvable.');
  await loadManagedRestaurant(dish.restaurant, user);
  return dish;
}

// PUT /api/dishes/:id  (infos, prix, disponibilité, catégorie)
export const update = async (req, res, next) => {
  try {
    const dish = await loadDish(req.params.id, req.user);
    const data = pick(req.body, WRITABLE);
    if (data.categorie) await assertCategoryMatches(data.categorie, dish.restaurant);
    Object.assign(dish, data);
    await dish.save();
    res.json({ success: true, dish });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/dishes/:id
export const remove = async (req, res, next) => {
  try {
    const dish = await loadDish(req.params.id, req.user);
    await dish.deleteOne();
    res.json({ success: true, message: 'Plat supprimé.' });
  } catch (err) {
    next(err);
  }
};

