import mongoose from 'mongoose';

// Les types de cuisine gérés par l'administrateur (Pizza, Tunisien, Fast-food...)
const cuisineSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la cuisine est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    // Nom d'une icône de l'application (voir core/icon.ts), ex : "pizza", "utensils"
    icon: { type: String, trim: true, default: 'utensils' }
  },
  { timestamps: true }
);

// Un nom de cuisine est unique, sans tenir compte des majuscules (Pizza = pizza)
cuisineSchema.index({ nom: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

export default mongoose.model('Cuisine', cuisineSchema);
