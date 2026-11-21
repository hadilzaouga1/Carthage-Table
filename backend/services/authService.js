import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import generateToken from '../utils/generateToken.js';
import { validateRegister } from '../validators/authValidator.js';

// Prépare ce qu'on renvoie au client : l'utilisateur SANS le mot de passe + le token
const buildAuthResponse = (user) => ({
  token: generateToken(user._id),
  user: {
    id: user._id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    role: user.role
  }
});

// INSCRIPTION
export async function register(body) {
  // 1. On vérifie les données
  validateRegister(body);

  // 2. On vérifie que l'email n'existe pas déjà
  const exists = await User.findOne({ email: body.email.toLowerCase() });
  if (exists) throw new ApiError(409, 'Cet email est déjà utilisé');

  // 3. On crée le compte. Le rôle est toujours "client" :
  //    on ne lit PAS body.role (sinon n'importe qui deviendrait admin !)
  const user = await User.create({
    nom: body.nom,
    prenom: body.prenom,
    email: body.email,
    telephone: body.telephone,
    password: body.password,
    role: 'client'
  });

  return buildAuthResponse(user);
}

// CONNEXION
export async function login({ email, password }) {
  if (!email || !password) throw new ApiError(400, 'Email et mot de passe obligatoires');

  // On récupère l'utilisateur AVEC son mot de passe (select: false par défaut)
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  // Même message si l'email ou le mot de passe est faux (sécurité)
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Email ou mot de passe incorrect');
  }
  // Règle 10 : un compte désactivé ne peut plus se connecter
  if (!user.isActive) throw new ApiError(403, 'Votre compte est désactivé');

  return buildAuthResponse(user);
}