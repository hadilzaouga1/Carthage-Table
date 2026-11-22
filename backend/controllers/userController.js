import asyncHandler from '../utils/asyncHandler.js';
import * as userService from '../services/userService.js';

// GET /api/users/profile : infos de l'utilisateur connecté
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

// PUT /api/users/profile : modifier nom, prénom, téléphone
export const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  res.json({ success: true, user });
});

// PUT /api/users/password : modifier le mot de passe
export const changePassword = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.body);
  res.json({ success: true, message: 'Mot de passe modifié' });
});

// GET /api/users/favorites : liste des favoris de l'utilisateur connecté
export const getFavorites = asyncHandler(async (req, res) => {
  const favorites = await userService.getFavorites(req.user._id);
  res.json({ success: true, favorites });
});

// POST /api/users/favorites/:restaurantId : ajouter/retirer un restaurant des favoris
export const toggleFavorite = asyncHandler(async (req, res) => {
  const result = await userService.toggleFavorite(req.user._id, req.params.restaurantId);
  res.json({ success: true, ...result });
});

// GET /api/users (admin)
export const listUsers = asyncHandler(async (req, res) => {
  res.json({ success: true, ...(await userService.listUsers(req.query)) });
});

// PUT /api/users/:id/status (admin) : { "isActive": false }
export const setUserStatus = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await userService.setActive(req.user, req.params.id, req.body.isActive) });
});

// PUT /api/users/:id/role (admin) : { "role": "restaurateur" }
export const setUserRole = asyncHandler(async (req, res) => {
  res.json({ success: true, user: await userService.setRole(req.user, req.params.id, req.body.role) });
});