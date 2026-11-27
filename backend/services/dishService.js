import mongoose from 'mongoose';
import Dish from '../models/Dish.js';
import Category from '../models/Category.js';
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import pick from '../utils/pick.js';
import assertCanManage from '../utils/assertCanManage.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EDITABLE_FIELDS = ['nom', 'description', 'prix', 'image', 'disponible', 'categorie'];

// Vérifie que la catégorie existe ET appartient bien à ce restaurant
async function checkCategory(categoryId, restaurantId) {
  const category = await Category.findOne({ _id: categoryId, restaurant: restaurantId });
  if (!category) throw new ApiError(400, "Cette catégorie n'appartient pas à ce restaurant");
}

// LISTE : /api/dishes?restaurant=ID&categorie=ID&search=pizza&page=1&limit=12
// Filtrer sur les restaurants validés, sauf si le propriétaire ou l'admin consulte
export async function listDishes(query = {}, user = null) {
  const { restaurant, categorie, search, q, page, limit } = query;
  const filter = {};

  if (restaurant) {
    if (!mongoose.isValidObjectId(restaurant)) {
      if (page !== undefined && page !== null && String(page).trim() !== '') {
        return { dishes: [], total: 0, page: Math.max(parseInt(page, 10) || 1, 1), pages: 0 };
      }
      return [];
    }
    const rest = await Restaurant.findById(restaurant);
    if (!rest) {
      if (page !== undefined && page !== null && String(page).trim() !== '') {
        return { dishes: [], total: 0, page: Math.max(parseInt(page, 10) || 1, 1), pages: 0 };
      }
      return [];
    }
    const isOwner = user && rest.owner && String(rest.owner) === String(user._id);
    const isAdmin = user && user.role === 'admin';
    if (rest.status !== 'valide' && !isOwner && !isAdmin) {
      if (page !== undefined && page !== null && String(page).trim() !== '') {
        return { dishes: [], total: 0, page: Math.max(parseInt(page, 10) || 1, 1), pages: 0 };
      }
      return [];
    }
    filter.restaurant = rest._id;
  } else {
    // Si aucun restaurant spécifié : les visiteurs publics et clients ne voient que les restaurants validés
    if (user && user.role === 'admin') {
      // L'administrateur a une vue complète
    } else if (user && user.role === 'restaurateur') {
      const [validRests, myRests] = await Promise.all([
        Restaurant.find({ status: 'valide' }).distinct('_id'),
        Restaurant.find({ owner: user._id }).distinct('_id')
      ]);
      filter.restaurant = { $in: [...new Set([...validRests.map(String), ...myRests.map(String)])] };
    } else {
      const validRests = await Restaurant.find({ status: 'valide' }).distinct('_id');
      filter.restaurant = { $in: validRests };
    }
  }

  if (categorie) {
    if (mongoose.isValidObjectId(categorie)) {
      filter.categorie = categorie;
    }
  }

  const searchKeyword = search || q;
  if (searchKeyword) {
    filter.nom = { $regex: escapeRegex(String(searchKeyword).trim()), $options: 'i' };
  }

  // Pagination optionnelle : ne paginer que si page est fourni (pour compatibilité avec le frontend qui attend un tableau)
  if (page !== undefined && page !== null && String(page).trim() !== '') {
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 12, 1), 100);

    const [dishes, total] = await Promise.all([
      Dish.find(filter)
        .populate('categorie', 'nom')
        .collation({ locale: 'fr' })
        .sort({ nom: 1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum),
      Dish.countDocuments(filter)
    ]);

    return {
      dishes,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1
    };
  }

  return Dish.find(filter)
    .populate('categorie', 'nom')
    .collation({ locale: 'fr' })
    .sort({ nom: 1 });
}

// AJOUT d'un plat
export async function createDish(user, body) {
  const restaurant = await Restaurant.findById(body.restaurant);
  if (!restaurant) throw new ApiError(404, 'Restaurant introuvable');
  assertCanManage(user, restaurant); // seulement dans SON restaurant
  await checkCategory(body.categorie, restaurant._id);
  return Dish.create({ ...pick(body, EDITABLE_FIELDS), restaurant: restaurant._id });
}

// MODIFICATION (infos, prix, disponibilité, catégorie)
export async function updateDish(user, id, body) {
  const dish = await Dish.findById(id);
  if (!dish) throw new ApiError(404, 'Plat introuvable');
  assertCanManage(user, await Restaurant.findById(dish.restaurant));
  if (body.categorie) await checkCategory(body.categorie, dish.restaurant);
  Object.assign(dish, pick(body, EDITABLE_FIELDS));
  await dish.save();
  return dish;
}

// SUPPRESSION
export async function deleteDish(user, id) {
  const dish = await Dish.findById(id);
  if (!dish) throw new ApiError(404, 'Plat introuvable');
  assertCanManage(user, await Restaurant.findById(dish.restaurant));
  await dish.deleteOne();
}