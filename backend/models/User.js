import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Schéma = la "forme" d'un utilisateur dans MongoDB
const userSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom est obligatoire'], trim: true },
    prenom: { type: String, required: [true, 'Le prénom est obligatoire'], trim: true },
    email: {
      type: String,
      required: [true, "L'email est obligatoire"],
      unique: true,      // règle 1 : un email = un seul compte
      lowercase: true,   // on enregistre toujours en minuscules
      trim: true
    },
    telephone: { type: String, required: [true, 'Le téléphone est obligatoire'], trim: true },
    password: {
      type: String,
      required: true,
      select: false      // le mot de passe n'est jamais renvoyé par défaut
    },
    // Les 3 rôles du cahier des charges. Par défaut : client
    role: { type: String, enum: ['client', 'restaurateur', 'admin'], default: 'client' },
    // Un compte désactivé ne peut plus se connecter (règle 10)
    isActive: { type: Boolean, default: true },
    // Restaurants favoris de l'utilisateur
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' }]
  },
  { timestamps: true } // ajoute automatiquement createdAt et updatedAt
);

// Avant chaque sauvegarde : on hache le mot de passe (règle 11)
userSchema.pre('save', async function () {
  // Si le mot de passe n'a pas changé, on ne fait rien
  if (!this.isModified('password')) return;
  // On transforme "Abc12345" en un texte illisible (hash)
  this.password = await bcrypt.hash(this.password, 10);
});

// Méthode pour comparer le mot de passe saisi avec le hash enregistré
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

export default mongoose.model('User', userSchema);