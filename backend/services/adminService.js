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

// Commandes du jour pour l'administrateur
export async function getTodayOrders() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const orders = await Order.find({
    createdAt: { $gte: startOfDay, $lte: endOfDay }
  })
    .populate('client', 'nom prenom telephone email')
    .populate('restaurant', 'nom adresse telephone')
    .sort({ createdAt: -1 });

  const totalJour = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const livrees = orders.filter((o) => o.statut === 'livree');
  const chiffreAffairesJour = livrees.reduce((sum, o) => sum + (o.total || 0), 0);

  return {
    orders,
    totalCommandes: orders.length,
    chiffreAffairesJour: Math.round(chiffreAffairesJour * 1000) / 1000,
    totalJour: Math.round(totalJour * 1000) / 1000
  };
}