import Order from '../models/Order.js';
import Dish from '../models/Dish.js';
import Restaurant from '../models/Restaurant.js';
import ApiError from '../utils/ApiError.js';
import assertCanManage from '../utils/assertCanManage.js';
import { computeTotals } from '../utils/pricing.js';
import { TRANSITIONS, canTransition } from '../utils/orderStatus.js';

// Filtre des commandes visibles par un restaurateur : celles de SES restaurants
// (l'admin voit toutes les commandes)
async function ordersFilterFor(user) {
  if (user.role === 'admin') return {};
  const ids = await Restaurant.find({ owner: user._id }).distinct('_id');
  return { restaurant: { $in: ids } };
}

// PASSER UNE COMMANDE
export async function createOrder(user, body) {
  const { restaurant: restaurantId, articles, adresseLivraison, remarque, modePaiement = 'livraison', codePromo } = body;

  // --- Vérifications de base ---
  if (!restaurantId) throw new ApiError(400, 'Le restaurant est obligatoire');
  // Règle 4 : au moins un article
  if (!Array.isArray(articles) || articles.length === 0) {
    throw new ApiError(400, 'La commande doit contenir au moins un article');
  }
  if (!adresseLivraison || !adresseLivraison.trim()) {
    throw new ApiError(400, "L'adresse de livraison est obligatoire");
  }
  // Première version : paiement à la livraison seulement (le paiement en ligne est facultatif)
  if (modePaiement !== 'livraison') {
    throw new ApiError(400, 'Seul le paiement à la livraison est disponible pour le moment');
  }

  // --- Le restaurant doit exister, être validé et ouvert ---
  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant || restaurant.status !== 'valide') throw new ApiError(404, 'Restaurant introuvable');
  if (!restaurant.isOpen) throw new ApiError(400, 'Ce restaurant est actuellement fermé');

  // --- On regroupe les quantités par plat (si le même plat est envoyé 2 fois) ---
  const quantities = new Map();
  for (const item of articles) {
    const q = Number(item.quantite);
    // Règle 5 : quantité entière >= 1
    if (!item.plat || !Number.isInteger(q) || q < 1) {
      throw new ApiError(400, 'Chaque article doit avoir un plat et une quantité entière supérieure ou égale à 1');
    }
    const key = String(item.plat);
    quantities.set(key, (quantities.get(key) || 0) + q);
  }

  // --- On lit les VRAIS plats dans la base (on ne fait jamais confiance aux prix d'Angular) ---
  const dishes = await Dish.find({ _id: { $in: [...quantities.keys()] }, restaurant: restaurant._id });
  if (dishes.length !== quantities.size) {
    throw new ApiError(400, 'Un ou plusieurs plats sont introuvables dans ce restaurant');
  }
  // Règle 3 : seulement des plats disponibles
  const unavailable = dishes.find((d) => !d.disponible);
  if (unavailable) throw new ApiError(400, `Le plat "${unavailable.nom}" n'est pas disponible`);

  // --- Construction des lignes : nom et prix copiés depuis la base ---
  const lignes = dishes.map((d) => ({
    plat: d._id,
    nom: d.nom,
    quantite: quantities.get(String(d._id)),
    prixUnitaire: d.prix
  }));

  // --- Règle 6 : le total (et le code promo) sont calculés par le SERVEUR ---
  const { sousTotal, codePromo: code, remise, fraisLivraison, total } = computeTotals(lignes, restaurant.fraisLivraison, codePromo);

  return Order.create({
    client: user._id,
    restaurant: restaurant._id,
    articles: lignes,
    adresseLivraison: adresseLivraison.trim(),
    sousTotal,
    codePromo: code || null,
    remise,
    fraisLivraison,
    total,
    modePaiement,
    remarque
  });
}

// COMMANDES DU CLIENT CONNECTÉ
export function listMyOrders(user) {
  return Order.find({ client: user._id })
    .populate('restaurant', 'nom image') // on remplace l'id du restaurant par son nom et son image
    .sort({ createdAt: -1 });
}

// COMMANDES REÇUES PAR LE RESTAURATEUR (filtre facultatif : ?statut=en_attente)
export async function listRestaurantOrders(user, { statut }) {
  const filter = await ordersFilterFor(user);
  if (statut) filter.statut = statut;
  return Order.find(filter)
    .populate('client', 'nom prenom telephone')
    .populate('restaurant', 'nom')
    .sort({ createdAt: -1 });
}

// DÉTAILS D'UNE COMMANDE (le client, le restaurateur concerné, ou l'admin)
export async function getOrder(user, id) {
  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Commande introuvable');

  let allowed = user.role === 'admin' || order.client.toString() === user._id.toString();
  if (!allowed && user.role === 'restaurateur') {
    const restaurant = await Restaurant.findById(order.restaurant);
    allowed = restaurant.owner.toString() === user._id.toString();
  }
  if (!allowed) throw new ApiError(403, "Vous n'avez pas accès à cette commande");

  return Order.findById(id)
    .populate('restaurant', 'nom adresse')
    .populate('client', 'nom prenom telephone');
}

// CHANGER LE STATUT
export async function updateStatus(user, id, statut) {
  if (!Object.keys(TRANSITIONS).includes(statut)) throw new ApiError(400, 'Statut invalide');

  const order = await Order.findById(id);
  if (!order) throw new ApiError(404, 'Commande introuvable');

  // --- Qui a le droit ? ---
  if (user.role === 'client') {
    // Le client peut seulement ANNULER sa propre commande, tant qu'elle est en attente
    if (order.client.toString() !== user._id.toString()) throw new ApiError(403, "Cette commande n'est pas la vôtre");
    if (statut !== 'annulee') throw new ApiError(403, 'Un client peut seulement annuler sa commande');
    if (order.statut !== 'en_attente') throw new ApiError(400, "Vous ne pouvez annuler qu'une commande en attente");
  } else {
    // Règle 7 : un restaurateur ne modifie que les commandes de SES restaurants
    assertCanManage(user, await Restaurant.findById(order.restaurant));
  }

  // Règle 9 : une commande livrée ne peut plus être modifiée
  if (order.statut === 'livree') throw new ApiError(400, 'Une commande livrée ne peut plus être modifiée');

  // Règle 8 : on respecte le cycle de vie
  if (!canTransition(order.statut, statut)) {
    throw new ApiError(400, `Passage impossible : ${order.statut} → ${statut}`);
  }

  order.statut = statut;
  await order.save();
  return order;
}

// STATISTIQUES DU TABLEAU DE BORD RESTAURATEUR
export async function getStats(user) {
  const filter = await ordersFilterFor(user);

  const [totalOrders, enAttente, acceptees, revenue, topDishes] = await Promise.all([
    Order.countDocuments(filter),                                   // nombre total de commandes
    Order.countDocuments({ ...filter, statut: 'en_attente' }),      // en attente
    Order.countDocuments({ ...filter, statut: 'acceptee' }),        // acceptées
    // Chiffre d'affaires : somme des commandes LIVRÉES
    Order.aggregate([
      { $match: { ...filter, statut: 'livree' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    // Plats les plus commandés (commandes annulées exclues)
    Order.aggregate([
      { $match: { ...filter, statut: { $ne: 'annulee' } } },
      { $unwind: '$articles' },                                     // une ligne par article
      { $group: { _id: '$articles.nom', quantite: { $sum: '$articles.quantite' } } },
      { $sort: { quantite: -1 } },
      { $limit: 5 }
    ])
  ]);

  return {
    totalOrders,
    enAttente,
    acceptees,
    chiffreAffaires: revenue[0]?.total || 0,
    platsPopulaires: topDishes.map((d) => ({ nom: d._id, quantite: d.quantite }))
  };
}