import mongoose from 'mongoose';

// Une catégorie de plats (Pizzas, Boissons...) appartient à UN restaurant
const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la catégorie est obligatoire'], trim: true },
    description: { type: String, default: '', trim: true },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true }
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);