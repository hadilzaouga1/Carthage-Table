import mongoose from 'mongoose';

// Catégorie GÉNÉRALE de cuisine (Pizza, Tunisien, Fast-food...) gérée par l'administrateur.
// À ne pas confondre avec Category : catégorie de plats propre à un restaurant (Entrées, Desserts...).
const cuisineSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la cuisine est obligatoire'], trim: true, unique: true },
    description: { type: String, trim: true, default: '' },
    icon: { type: String, default: '🍽️' }
  },
  { timestamps: true }
);

// Unicité insensible à la casse : "pizza" et "Pizza" sont la même cuisine
cuisineSchema.index({ nom: 1 }, { unique: true, collation: { locale: 'fr', strength: 2 } });

export default mongoose.model('Cuisine', cuisineSchema);
