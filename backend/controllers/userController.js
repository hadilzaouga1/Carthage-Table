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