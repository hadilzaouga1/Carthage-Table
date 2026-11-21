export default class ApiError extends Error {
  constructor(statusCode, message) {
    // On appelle le constructeur de la classe Error avec le message
    super(message);
    // On garde le code HTTP pour le renvoyer au client
    this.statusCode = statusCode;
  }
}