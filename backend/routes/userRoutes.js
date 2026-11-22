import { Router } from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getProfile, updateProfile, changePassword,
  getFavorites, getFavoriteRestaurants, toggleFavorite,
  listUsers, setUserStatus, setUserRole
} from '../controllers/userController.js';

const router = Router();

// Toutes les routes exigent d'être connecté
router.use(protect);

// Profil de l'utilisateur connecté
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

// Favoris de l'utilisateur connecté (avant "/:id" pour éviter tout conflit)
router.get('/favorites', getFavorites);
router.get('/favorites/restaurants', getFavoriteRestaurants);
router.post('/favorites/:restaurantId', toggleFavorite);

// Gestion des utilisateurs : réservée à l'admin
router.get('/', authorize('admin'), listUsers);
router.put('/:id/status', authorize('admin'), setUserStatus);
router.put('/:id/role', authorize('admin'), setUserRole);

export default router;