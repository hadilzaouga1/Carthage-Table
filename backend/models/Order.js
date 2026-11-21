import mongoose from 'mongoose';

// Une ligne de commande : on COPIE le nom et le prix du plat au moment de l'achat,
// pour qu'une modification ultérieure du menu ne change pas l'historique
const orderItemSchema = new mongoose.Schema(
  {
    plat: { type: mongoose.Schema.Types.ObjectId, ref: 'Dish', required: true },
    nom: { type: String, required: true },
    quantite: { type: Number, required: true, min: [1, 'La quantité doit être au moins 1'] },
    prixUnitaire: { type: Number, required: true, min: 0 }
  },
  { _id: false } // pas besoin d'un id pour chaque ligne
);

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    articles: { type: [orderItemSchema], required: true },
    adresseLivraison: { type: String, required: [true, "L'adresse de livraison est obligatoire"], trim: true },
    sousTotal: { type: Number, required: true },
    fraisLivraison: { type: Number, required: true },
    total: { type: Number, required: true },
    modePaiement: { type: String, enum: ['livraison', 'en_ligne'], default: 'livraison' },
    // Les 6 statuts du cycle de vie de la commande
    statut: {
      type: String,
      enum: ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree', 'annulee'],
      default: 'en_attente'
    },
    remarque: { type: String, default: '', trim: true }
  },
  { timestamps: true }
);

export default mongoose.model('Order', orderSchema);