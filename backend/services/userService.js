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
// Protège les caractères spéciaux d'une recherche
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ADMIN : liste des utilisateurs (?search=ali&role=client&page=1)
export async function listUsers({ search, role, page, limit }) {
  const filter = {};
  if (role) filter.role = role;
  if (search) {
    // On cherche dans le nom, le prénom ou l'email
    const regex = { $regex: escapeRegex(search), $options: 'i' };
    filter.$or = [{ nom: regex }, { prenom: regex }, { email: regex }];
  }
  const pageNum = Math.max(parseInt(page) || 1, 1);
  const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    User.countDocuments(filter)
  ]);
  return { users, total, page: pageNum, pages: Math.ceil(total / limitNum) };
}

// ADMIN : activer ou désactiver un compte
export async function setActive(admin, id, isActive) {
  if (typeof isActive !== 'boolean') throw new ApiError(400, 'isActive doit être true ou false');
  // L'admin ne peut pas se désactiver lui-même (il se bloquerait)
  if (id === admin._id.toString()) throw new ApiError(400, 'Vous ne pouvez pas modifier votre propre compte');
  const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}

// ADMIN : changer le rôle (par exemple client → restaurateur)
export async function setRole(admin, id, role) {
  if (!['client', 'restaurateur', 'admin'].includes(role)) throw new ApiError(400, 'Rôle invalide');
  if (id === admin._id.toString()) throw new ApiError(400, 'Vous ne pouvez pas modifier votre propre rôle');
  const user = await User.findByIdAndUpdate(id, { role }, { new: true });
  if (!user) throw new ApiError(404, 'Utilisateur introuvable');
  return user;
}