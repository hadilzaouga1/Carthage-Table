import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du plat est obligatoire'], trim: true },
    description: { type: String, default: '', trim: true },
    prix: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix ne peut pas être négatif'] },
    image: { type: String, default: '' },
    // Un plat indisponible ne pourra pas être ajouté au panier
    disponible: { type: Boolean, default: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'La catégorie est obligatoire'] },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Dish', dishSchema);