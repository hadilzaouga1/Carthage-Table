import Restaurant from '../models/Restaurant.js';

const httpError = (statusCode, message) => Object.assign(new Error(message), { statusCode });

/**
 * Règle : un restaurateur ne gère que SES restaurants, l'admin peut tout superviser.
 * Charge le restaurant et lève une erreur 404/403 sinon.
 */
async function loadManagedRestaurant(restaurantId, user) {
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw httpError(404, 'Restaurant introuvable.');
  if (user.role !== 'admin' && String(restaurant.owner) !== String(user._id)) {
    throw httpError(403, "Ce restaurant ne vous appartient pas.");
  }
  return restaurant;
}

export { loadManagedRestaurant, httpError };
