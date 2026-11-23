import mongoose from 'mongoose';
import Review from '../models/Review.js';
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';
import ApiError from '../utils/ApiError.js';

const round1 = (n) => Math.round(n * 10) / 10;

async function recalculateRestaurantRating(restaurantId) {
  const stats = await Review.aggregate([
    { $match: { restaurant: new mongoose.Types.ObjectId(String(restaurantId)) } },
    {
      $group: {
        _id: '$restaurant',
        avgNote: { $avg: '$note' },
        count: { $sum: 1 }
      }
    }
  ]);

  const noteMoyenne = stats[0] ? round1(stats[0].avgNote) : 0;
  const nombreAvis = stats[0] ? stats[0].count : 0;

  await Restaurant.findByIdAndUpdate(restaurantId, { noteMoyenne, nombreAvis });
  return { noteMoyenne, nombreAvis };
}

// GET /api/reviews/latest?limit=6 (public : derniers avis pour la page d'accueil)
export async function listLatestReviews(limit = 6) {
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 6, 1), 12);
  const reviews = await Review.find({})
    .populate('client', 'nom prenom')
    .populate('restaurant', 'nom typeCuisine')
    .sort({ createdAt: -1 })
    .limit(safeLimit);

  return reviews.filter((r) => r.restaurant);
}

// GET /api/reviews/restaurant/:restaurantId (public)
export async function listRestaurantReviews(restaurantId) {
  if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, 'Identifiant de restaurant invalide');
  }

  const restaurant = await Restaurant.findById(restaurantId).select('noteMoyenne nombreAvis');
  if (!restaurant) throw new ApiError(404, 'Restaurant introuvable');

  const reviews = await Review.find({ restaurant: restaurantId })
    .populate('client', 'nom prenom')
    .sort({ createdAt: -1 });

  return {
    reviews,
    noteMoyenne: restaurant.noteMoyenne ?? 0,
    nombreAvis: restaurant.nombreAvis ?? 0
  };
}

// POST /api/reviews (utilisateur connecté : crée ou met à jour l'avis du client sur ce restaurant)
export async function upsertReview(user, body) {
  const { restaurant: restaurantId, order: orderId, note, commentaire = '' } = body || {};

  if (!restaurantId || !mongoose.Types.ObjectId.isValid(restaurantId)) {
    throw new ApiError(400, 'Restaurant invalide');
  }

  const numericNote = Number(note);
  if (!Number.isInteger(numericNote) || numericNote < 1 || numericNote > 5) {
    throw new ApiError(400, 'La note doit être un entier compris entre 1 et 5');
  }

  const restaurant = await Restaurant.findById(restaurantId);
  if (!restaurant) throw new ApiError(404, 'Restaurant introuvable');

  let verifiedOrderId = null;
  if (orderId) {
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      throw new ApiError(400, 'Identifiant de commande invalide');
    }
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Commande introuvable');
    if (order.client.toString() !== user._id.toString()) {
      throw new ApiError(403, "Vous ne pouvez pas noter une commande qui ne vous appartient pas");
    }
    if (order.restaurant.toString() !== String(restaurantId)) {
      throw new ApiError(400, 'Cette commande ne correspond pas à ce restaurant');
    }
    if (order.statut !== 'livree') {
      throw new ApiError(400, 'Vous ne pouvez noter un restaurant qu’après une commande livrée');
    }
    verifiedOrderId = order._id;
  }

  const cleanComment = typeof commentaire === 'string' ? commentaire.trim() : '';

  const review = await Review.findOneAndUpdate(
    { restaurant: restaurantId, client: user._id },
    {
      $set: {
        note: numericNote,
        commentaire: cleanComment,
        ...(verifiedOrderId ? { order: verifiedOrderId } : {})
      }
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).populate('client', 'nom prenom');

  const stats = await recalculateRestaurantRating(restaurantId);
  return { review, ...stats };
}

// DELETE /api/reviews/:id (auteur de l'avis ou admin)
export async function deleteReview(user, reviewId) {
  if (!mongoose.Types.ObjectId.isValid(reviewId)) {
    throw new ApiError(400, "Identifiant d'avis invalide");
  }

  const review = await Review.findById(reviewId);
  if (!review) throw new ApiError(404, 'Avis introuvable');

  const isOwner = review.client.toString() === user._id.toString();
  const isAdmin = user.role === 'admin';
  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Action non autorisée sur cet avis');
  }

  const restaurantId = review.restaurant;
  await review.deleteOne();
  const stats = await recalculateRestaurantRating(restaurantId);
  return { deletedId: reviewId, ...stats };
}