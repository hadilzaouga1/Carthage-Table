import mongoose from 'mongoose';

const dishSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du plat est obligatoire'], trim: true },
<<<<<<< HEAD
    description: { type: String, trim: true, default: '' },
    prix: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix ne peut pas être négatif'] },
    image: { type: String, default: '' },
    icon: { type: String, default: '🍽️' },
    disponible: { type: Boolean, default: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
=======
    description: { type: String, default: '', trim: true },
    prix: { type: Number, required: [true, 'Le prix est obligatoire'], min: [0, 'Le prix ne peut pas être négatif'] },
    image: { type: String, default: '' },
    // Un plat indisponible ne pourra pas être ajouté au panier
    disponible: { type: Boolean, default: true },
    categorie: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: [true, 'La catégorie est obligatoire'] },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
  },
  { timestamps: true }
);

<<<<<<< HEAD
export default mongoose.model('Dish', dishSchema);
=======
export default mongoose.model('Dish', dishSchema);
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
