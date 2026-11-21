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
    isOpen: { type: Boolean, default: true },
    // pending : en attente de validation admin, approved : visible, suspended : masqué
    status: { type: String, enum: ['pending', 'approved', 'suspended'], default: 'approved' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  { timestamps: true }
);

restaurantSchema.index({ nom: 'text', typeCuisine: 'text' });

export default mongoose.model('Restaurant', restaurantSchema);
