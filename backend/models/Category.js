import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom de la catégorie est obligatoire'], trim: true },
    description: { type: String, trim: true, default: '' },
    restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true, index: true },
  },
  { timestamps: true }
);

// Une catégorie par nom et par restaurant
categorySchema.index({ restaurant: 1, nom: 1 }, { unique: true });

export default mongoose.model('Category', categorySchema);
