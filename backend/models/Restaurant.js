import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du restaurant est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    adresse: { type: String, required: [true, "L'adresse est obligatoire"], trim: true },
    typeCuisine: { type: String, required: [true, 'Le type de cuisine est obligatoire'], trim: true },
    image: { type: String, default: '' },
    icon: { type: String, default: '🍽️' }, // emoji d'affichage tant qu'il n'y a pas d'image
    fraisLivraison: { type: Number, required: true, min: [0, 'Les frais ne peuvent pas être négatifs'], default: 0 },
    horaires: { type: String, default: '10:00 - 23:00' },
    isOpen: { type: Boolean, default: true }, // ouvert ou fermé
    // L'admin peut valider ou suspendre un restaurant partenaire
    status: { type: String, enum: ['en_attente', 'valide', 'suspendu'], default: 'en_attente' },
    // owner = le compte du restaurateur (référence vers la collection users)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }
  },
  { timestamps: true }
);

// Index de recherche pour la barre de recherche
restaurantSchema.index({ nom: 'text', typeCuisine: 'text' });

export default mongoose.model('Restaurant', restaurantSchema);