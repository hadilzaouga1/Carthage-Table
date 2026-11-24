import ApiError from '../utils/ApiError.js';

// Autorise seulement certains rôles : authorize('admin', 'restaurateur')
// À utiliser APRÈS protect (règle 12 : vérification côté serveur)
export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new ApiError(403, "Vous n'avez pas le droit d'accéder à cette ressource"));
  }
  next();
};