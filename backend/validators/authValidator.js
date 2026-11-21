import ApiError from '../utils/ApiError.js';

// Vérifie les données d'inscription. Si quelque chose ne va pas : erreur 400
export function validateRegister(body) {
  const { nom, prenom, email, telephone, password, confirmation } = body;

  // Tous les champs sont obligatoires
  if (!nom || !prenom || !email || !telephone || !password || !confirmation) {
    throw new ApiError(400, 'Tous les champs sont obligatoires');
  }
  // Email valide : texte@texte.texte
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new ApiError(400, "L'adresse email n'est pas valide");
  }
  // Téléphone tunisien : 8 chiffres
  if (!/^\d{8}$/.test(telephone)) {
    throw new ApiError(400, 'Le téléphone doit contenir 8 chiffres');
  }
  // Règle de sécurité du mot de passe : 8 caractères, 1 lettre, 1 chiffre
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    throw new ApiError(400, 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre');
  }
  // La confirmation doit être identique
  if (password !== confirmation) {
    throw new ApiError(400, 'La confirmation ne correspond pas au mot de passe');
  }
}