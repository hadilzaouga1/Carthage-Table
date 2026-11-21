import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';

// Modifier nom, prénom et téléphone (section 3.3 du cahier)
export async function updateProfile(userId, { nom, prenom, telephone }) {
  if (telephone && !/^\d{8}$/.test(telephone)) {
    throw new ApiError(400, 'Le téléphone doit contenir 8 chiffres');
  }
  // On ne modifie QUE ces 3 champs (pas le rôle, pas l'email)
  return User.findByIdAndUpdate(
    userId,
    { nom, prenom, telephone },
    { new: true, runValidators: true } // new: renvoie la version mise à jour
  );
}

// Changer le mot de passe
export async function changePassword(userId, { oldPassword, newPassword }) {
  if (!oldPassword || !newPassword) throw new ApiError(400, 'Ancien et nouveau mot de passe obligatoires');
  if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword)) {
    throw new ApiError(400, 'Le mot de passe doit contenir au moins 8 caractères, une lettre et un chiffre');
  }
  const user = await User.findById(userId).select('+password');
  // On vérifie l'ancien mot de passe
  if (!(await user.comparePassword(oldPassword))) {
    throw new ApiError(401, 'Ancien mot de passe incorrect');
  }
  user.password = newPassword; // sera haché automatiquement par pre('save')
  await user.save();
}