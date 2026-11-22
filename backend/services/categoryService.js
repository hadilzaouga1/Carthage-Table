import Category from '../models/Category.js';
import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import ApiError from '../utils/ApiError.js';
import pick from '../utils/pick.js';
import assertCanManage from '../utils/assertCanManage.js';

// Liste des catégories d'un restaurant : /api/categories?restaurant=ID
export function listCategories({ restaurant }) {
  if (!restaurant) throw new ApiError(400, 'Le paramètre restaurant est obligatoire');
  return Category.find({ restaurant }).sort({ nom: 1 });
}

// Création : seulement dans SON restaurant
export async function createCategory(user, body) {
  const restaurant = await Restaurant.findById(body.restaurant);
  if (!restaurant) throw new ApiError(404, 'Restaurant introuvable');
  assertCanManage(user, restaurant);
  return Category.create({ ...pick(body, ['nom', 'description']), restaurant: restaurant._id });
}

// Modification
export async function updateCategory(user, id, body) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Catégorie introuvable');
  assertCanManage(user, await Restaurant.findById(category.restaurant));
  Object.assign(category, pick(body, ['nom', 'description']));
  await category.save();
  return category;
}

// Suppression (interdite s'il reste des plats dedans)
export async function deleteCategory(user, id) {
  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, 'Catégorie introuvable');
  assertCanManage(user, await Restaurant.findById(category.restaurant));
  const used = await Dish.countDocuments({ categorie: id });
  if (used > 0) throw new ApiError(400, 'Cette catégorie contient encore des plats');
  await category.deleteOne();
}