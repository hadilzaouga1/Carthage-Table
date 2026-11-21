import jwt from 'jsonwebtoken';

// Crée un token JWT contenant l'id de l'utilisateur
// Le client le renverra à chaque requête pour prouver qui il est
export default function generateToken(userId) {
  return jwt.sign(
    { id: userId },                       // données stockées dans le token
    process.env.JWT_SECRET,               // clé secrète (fichier .env)
    { expiresIn: process.env.JWT_EXPIRES_IN } // durée de validité
  );
}