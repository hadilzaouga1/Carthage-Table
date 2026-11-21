// Middleware appelé quand aucune route ne correspond à l'URL demandée
export const notFound = (req, res, next) => {
  // On crée une erreur 404 et on la passe au gestionnaire d'erreurs
  res.status(404);
  next(new Error(`Route introuvable : ${req.originalUrl}`));
};

// Gestionnaire d'erreurs central : TOUTES les erreurs de l'API passent ici
export const errorHandler = (err, req, res, next) => {
  // Si l'erreur a un code (ApiError) on l'utilise, sinon 500 = erreur serveur
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);

  // On renvoie toujours le même format JSON : facile à gérer côté Angular
  res.status(statusCode).json({
    success: false,
    message: err.message
  });
};