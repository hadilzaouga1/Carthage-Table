// Middleware appelé quand aucune route ne correspond à l'URL demandée
export const notFound = (req, res, next) => {
  // On crée une erreur 404 et on la passe au gestionnaire d'erreurs
  res.status(404);
  next(new Error(`Route introuvable : ${req.originalUrl}`));
};

// Gestionnaire d'erreurs central : TOUTES les erreurs de l'API passent ici
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  let message = err.message;

  // Id MongoDB invalide (ex : /api/restaurants/abc)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Identifiant invalide';
  }
  // Une règle du modèle n'est pas respectée (champ obligatoire, prix négatif...)
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }
  // Valeur déjà existante (index unique)
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Cette valeur existe déjà';
  }

  res.status(statusCode).json({ success: false, message });
};