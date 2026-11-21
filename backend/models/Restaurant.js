import mongoose from 'mongoose';

const restaurantSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du restaurant est obligatoire'], trim: true },
<<<<<<< HEAD
    description: { type: String, trim: true, default: '' },
    adresse: { type: String, required: [true, "L'adresse est obligatoire"], trim: true },
    typeCuisine: { type: String, required: [true, 'Le type de cuisine est obligatoire'], trim: true },
    image: { type: String, default: '' },
    icon: { type: String, default: '🍽️' }, // emoji d'affichage tant qu'il n'y a pas d'image
    fraisLivraison: { type: Number, required: true, min: [0, 'Les frais ne peuvent pas être négatifs'], default: 0 },
    horaires: { type: String, default: '10:00 - 23:00' },
    isOpen: { type: Boolean, default: true },
    // pending : en attente de validation admin, approved : visible, suspended : masqué
    status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'approved' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
=======
    description: { type: String, default: '', trim: true },
    adresse: { type: String, required: [true, "L'adresse est obligatoire"], trim: true },
    typeCuisine: { type: String, required: [true, 'Le type de cuisine est obligatoire'], trim: true },
    image: { type: String, default: '' },
    fraisLivraison: { type: Number, default: 0, min: [0, 'Les frais de livraison ne peuvent pas être négatifs'] },
    horaires: { type: String, default: '10:00 - 23:00' },
    isOpen: { type: Boolean, default: true }, // ouvert ou fermé
    // owner = le compte du restaurateur (référence vers la collection users)
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // L'admin peut valider ou suspendre un restaurant partenaire
    status: { type: String, enum: ['en_attente', 'valide', 'suspendu'], default: 'en_attente' }
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
  },
  { timestamps: true }
);

<<<<<<< HEAD
restaurantSchema.index({ nom: 'text', typeCuisine: 'text' });

export default mongoose.model('Restaurant', restaurantSchema);
=======
export default mongoose.model('Restaurant', restaurantSchema);
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
