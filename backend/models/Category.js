import mongoose from 'mongoose';

<<<<<<< HEAD
const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la catégorie est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
=======
// Une catégorie de plats (Pizzas, Boissons...) appartient à UN restaurant
const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la catégorie est obligatoire'], trim: true },
    description: { type: String, default: '', trim: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
  },
  { timestamps: true }
);

<<<<<<< HEAD
// Une catégorie par nom et par restaurant
categorySchema.index({ restaurant: 1, nom: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
=======
export default mongoose.model('Category', categorySchema);
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
