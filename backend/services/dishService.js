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

// LISTE : /api/dishes?restaurant=ID&categorie=ID&search=pizza
export function listDishes({ restaurant, categorie, search }) {
  const filter = {};
  if (restaurant) filter.restaurant = restaurant;
  if (categorie) filter.categorie = categorie;
  if (search) filter.nom = { $regex: escapeRegex(search), $options: 'i' };
  return Dish.find(filter)
    .populate('categorie', 'nom') // remplace l'id de la catégorie par son nom
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