import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

// Statistiques générales de la plateforme
export async function getStats() {
  const [clients, restaurateurs, restaurants, restaurantsEnAttente, orders, revenue, parStatut, topRestaurants] = await Promise.all([
    User.countDocuments({ role: 'client' }),                 // nombre de clients
    User.countDocuments({ role: 'restaurateur' }),           // nombre de restaurateurs
    Restaurant.countDocuments(),                             // nombre de restaurants
    Restaurant.countDocuments({ status: 'en_attente' }),     // restaurants à valider
    Order.countDocuments(),                                  // nombre de commandes
    // Chiffre d'affaires global : somme des commandes livrées
    Order.aggregate([
      { $match: { statut: 'livree' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    // Nombre de commandes par statut
    Order.aggregate([{ $group: { _id: '$statut', nombre: { $sum: 1 } } }]),
    // Les 5 restaurants qui reçoivent le plus de commandes (annulées exclues)
    Order.aggregate([
      { $match: { statut: { $ne: 'annulee' } } },
      { $group: { _id: '$restaurant', commandes: { $sum: 1 }, chiffreAffaires: { $sum: '$total' } } },
      { $sort: { commandes: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'restaurants', localField: '_id', foreignField: '_id', as: 'resto' } },
      { $project: { _id: 0, nom: { $arrayElemAt: ['$resto.nom', 0] }, commandes: 1, chiffreAffaires: 1 } }
    ])
  ]);

  return {
    clients,
    restaurateurs,
    restaurants,
    restaurantsEnAttente,
    commandes: orders,
    chiffreAffaires: revenue[0]?.total || 0,
    commandesParStatut: Object.fromEntries(parStatut.map((s) => [s._id, s.nombre])),
    restaurantsPopulaires: topRestaurants
  };
}