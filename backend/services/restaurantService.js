import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import pick from '../utils/pick.js';
import assertCanManage from '../utils/assertCanManage.js';

// Protège les caractères spéciaux d'une recherche (évite les bugs avec "(" ou "*")
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Champs qu'un restaurateur a le droit de modifier
const EDITABLE_FIELDS = ['nom', 'description', 'adresse', 'typeCuisine', 'image', 'fraisLivraison', 'horaires', 'isOpen'];

// Cherche un restaurant ou renvoie une erreur 404
async function findOrFail(id) {
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) throw new ApiError(404, 'Restaurant introuvable');
  return restaurant;
}

// LISTE avec recherche, filtres, tri et pagination
// Exemple : /api/restaurants?search=pizza&typeCuisine=Italien&open=true&page=1
export async function listRestaurants(query) {
  const { search, typeCuisine, open, sort, page, limit } = query;

  // Les clients ne voient que les restaurants validés par l'admin
  const filter = { status: 'valide' };
  if (search) filter.nom = { $regex: escapeRegex(search), $options: 'i' };   // i = sans tenir compte des majuscules
  if (typeCuisine) filter.typeCuisine = { $regex: `^${escapeRegex(typeCuisine)}$`, $options: 'i' };
  if (open === 'true') filter.isOpen = true; // seulement les ouverts

  // Pagination (exigence de performance du cahier)
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 12, 1), 50);

  const [restaurants, total] = await Promise.all([
    Restaurant.find(filter)
      .collation({ locale: 'fr' })                    // tri alphabétique sans tenir compte des accents/majuscules
      .sort({ nom: sort === 'desc' ? -1 : 1 })        // A→Z par défaut
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Restaurant.countDocuments(filter)
  ]);

  return { restaurants, total, page: pageNum, pages: Math.ceil(total / limitNum) };
}

// DÉTAILS d'un restaurant (visible seulement s'il est validé)
export async function getRestaurant(id) {
  const restaurant = await findOrFail(id);
  if (restaurant.status !== 'valide') throw new ApiError(404, 'Restaurant introuvable');
  return restaurant;
}

// MES restaurants (restaurateur connecté), même ceux en attente
export function getMyRestaurants(user) {
  return Restaurant.find({ owner: user._id }).sort({ createdAt: -1 });
}

// CRÉATION
export async function createRestaurant(user, body) {
  const data = pick(body, EDITABLE_FIELDS);

  if (user.role === 'admin') {
    // L'admin doit choisir le restaurateur propriétaire
    if (!body.owner) throw new ApiError(400, 'Veuillez indiquer le propriétaire (owner)');
    const owner = await User.findById(body.owner);
    if (!owner || owner.role !== 'restaurateur') {
      throw new ApiError(400, "Le propriétaire doit être un compte 'restaurateur'");
    }
    data.owner = owner._id;
    data.status = 'valide';          // créé par l'admin = déjà validé
  } else {
    data.owner = user._id;           // le restaurateur est le propriétaire
    data.status = 'en_attente';      // l'admin doit le valider
  }
  return Restaurant.create(data);
}

// MODIFICATION
export async function updateRestaurant(user, id, body) {
  const restaurant = await findOrFail(id);
  assertCanManage(user, restaurant); // règle : seulement SES restaurants

  const allowed = [...EDITABLE_FIELDS];
  if (user.role === 'admin') allowed.push('status'); // seul l'admin valide/suspend

  Object.assign(restaurant, pick(body, allowed));
  await restaurant.save(); // save() vérifie aussi les règles du modèle
  return restaurant;
}

// SUPPRESSION (avec ses catégories et ses plats)
export async function deleteRestaurant(user, id) {
  const restaurant = await findOrFail(id);
  assertCanManage(user, restaurant);
  await Dish.deleteMany({ restaurant: id });
  await Category.deleteMany({ restaurant: id });
  await restaurant.deleteOne();
}
// ADMIN : tous les restaurants, même en attente ou suspendus (?status=en_attente)
export function listAllRestaurants({ status }) {
  const filter = status ? { status } : {};
  return Restaurant.find(filter).populate('owner', 'nom prenom email').sort({ createdAt: -1 });
}