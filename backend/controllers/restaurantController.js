<<<<<<< HEAD
import mongoose from 'mongoose';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import { loadManagedRestaurant, httpError } from '../utils/ownership.js';

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const WRITABLE = ['nom', 'description', 'adresse', 'typeCuisine', 'image', 'icon', 'fraisLivraison', 'horaires', 'isOpen'];
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

// GET /api/restaurants?q=&cuisine=&open=true&sort=nom&page=1&limit=12
export const list = async (req, res, next) => {
  try {
    const { q, cuisine, open, sort } = req.query;
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 50);

    const filter = { status: 'approved' };
    if (q) filter.nom = { $regex: escapeRegex(String(q).trim()), $options: 'i' };
    if (cuisine && cuisine !== 'Tous') filter.typeCuisine = String(cuisine);
    if (open === 'true') filter.isOpen = true;

    const order = sort === 'recent' ? { createdAt: -1 } : { nom: 1 }; // alphabétique par défaut
    const [items, total] = await Promise.all([
      Restaurant.find(filter).sort(order).collation({ locale: 'fr' }).skip((page - 1) * limit).limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    res.json({ success: true, items, total, page, pages: Math.ceil(total / limit) || 1 });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurants/mine  (restaurateur : ses restaurants, admin : tous)
export const mine = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { owner: req.user._id };
    res.json({ success: true, items: await Restaurant.find(filter).sort({ nom: 1 }) });
  } catch (err) {
    next(err);
  }
};

// GET /api/restaurants/:id  → restaurant + menu groupé par catégorie
export const getOne = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) throw httpError(404, 'Restaurant introuvable.');
    const restaurant = await Restaurant.findOne({ _id: req.params.id, status: 'approved' });
    if (!restaurant) throw httpError(404, 'Restaurant introuvable.');

    const [categories, dishes] = await Promise.all([
      Category.find({ restaurant: restaurant._id }).sort({ createdAt: 1 }),
      Dish.find({ restaurant: restaurant._id }).sort({ nom: 1 }),
    ]);

    res.json({ success: true, restaurant, categories, dishes });
  } catch (err) {
    next(err);
  }
};

// POST /api/restaurants  (restaurateur ou admin)
export const create = async (req, res, next) => {
  try {
    const data = pick(req.body, WRITABLE);
    const isAdmin = req.user.role === 'admin';
    // Un restaurateur crée pour lui-même, en attente de validation ; l'admin peut désigner le propriétaire.
    data.owner = isAdmin && req.body.owner ? req.body.owner : req.user._id;
    data.status = isAdmin ? req.body.status || 'approved' : 'pending';

    const restaurant = await Restaurant.create(data);
    res.status(201).json({ success: true, restaurant });
  } catch (err) {
    next(err);
  }
};

// PUT /api/restaurants/:id
export const update = async (req, res, next) => {
  try {
    const restaurant = await loadManagedRestaurant(req.params.id, req.user);
    Object.assign(restaurant, pick(req.body, WRITABLE));
    // Seul l'admin valide ou suspend un restaurant partenaire
    if (req.user.role === 'admin' && req.body.status) restaurant.status = req.body.status;
    await restaurant.save();
    res.json({ success: true, restaurant });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/restaurants/:id  (supprime aussi catégories et plats)
export const remove = async (req, res, next) => {
  try {
    const restaurant = await loadManagedRestaurant(req.params.id, req.user);
    await Promise.all([
      Dish.deleteMany({ restaurant: restaurant._id }),
      Category.deleteMany({ restaurant: restaurant._id }),
      restaurant.deleteOne(),
    ]);
    res.json({ success: true, message: 'Restaurant supprimé.' });
  } catch (err) {
    next(err);
  }
};
=======
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
// GET /api/restaurants/all (admin)
export const listAll = asyncHandler(async (req, res) => {
  res.json({ success: true, restaurants: await service.listAllRestaurants(req.query) });
});
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
