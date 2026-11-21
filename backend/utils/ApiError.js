<<<<<<< HEAD
=======
// Une erreur personnalisée qui contient un code HTTP (400, 401, 404...)
// On l'utilisera partout : throw new ApiError(404, 'Restaurant introuvable')
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
export default class ApiError extends Error {
  constructor(statusCode, message) {
    // On appelle le constructeur de la classe Error avec le message
    super(message);
    // On garde le code HTTP pour le renvoyer au client
    this.statusCode = statusCode;
  }
}