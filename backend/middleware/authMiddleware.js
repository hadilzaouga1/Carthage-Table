import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import asyncHandler from '../utils/asyncHandler.js';

// Protège une route : seul un utilisateur connecté (avec un token valide) passe
export const protect = asyncHandler(async (req, res, next) => {
  // Le token arrive dans l'en-tête : Authorization: Bearer xxxxx
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw new ApiError(401, 'Veuillez vous connecter');
  }
  const token = header.split(' ')[1];

  // On vérifie le token (signature + expiration)
  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Token invalide ou expiré');
  }

  // On retrouve l'utilisateur en base
  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'Utilisateur introuvable');
  // Règle 10 : compte désactivé = accès refusé
  if (!user.isActive) throw new ApiError(403, 'Votre compte est désactivé');

  // On garde l'utilisateur pour les prochaines étapes (req.user)
  req.user = user;
  next();
});