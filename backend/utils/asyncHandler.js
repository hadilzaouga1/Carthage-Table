// Enveloppe une fonction async pour envoyer automatiquement
// les erreurs au gestionnaire d'erreurs (évite d'écrire try/catch partout)
const asyncHandler = (fn) => (req, res, next) =>
  // On exécute la fonction ; si elle échoue, on passe l'erreur à next()
  Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;