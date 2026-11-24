import ApiError from './ApiError.js';

// Vérifie que l'utilisateur a le droit de gérer ce restaurant :
// - l'admin peut tout gérer
// - le restaurateur seulement SES restaurants
export default function assertCanManage(user, restaurant) {
  if (user.role === 'admin') return;
  if (restaurant.owner.toString() === user._id.toString()) return;
  throw new ApiError(403, "Ce restaurant ne vous appartient pas");
}