import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

// Statistiques générales de la plateforme
export async function getStats() {
  const [clients, restaurants, restaurantsEnAttente, orders, revenue] = await Promise.all([
    User.countDocuments({ role: 'client' }),                 // nombre de clients
    Restaurant.countDocuments(),                             // nombre de restaurants
    Restaurant.countDocuments({ status: 'en_attente' }),     // restaurants à valider
    Order.countDocuments(),                                  // nombre de commandes
    // Chiffre d'affaires global : somme des commandes livrées
    Order.aggregate([
      { $match: { statut: 'livree' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
  ]);

  return { clients, restaurants, restaurantsEnAttente, commandes: orders, chiffreAffaires: revenue[0]?.total || 0 };
}