import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
      index: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    note: {
      type: Number,
      required: [true, 'La note est obligatoire'],
      min: [1, 'La note minimale est 1'],
      max: [5, 'La note maximale est 5']
    },
    commentaire: {
      type: String,
      trim: true,
      maxlength: [600, 'Le commentaire ne peut pas dépasser 600 caractères'],
      default: ''
    }
  },
  { timestamps: true }
);

// Un client ne peut publier qu'un seul avis par restaurant (mise à jour possible via upsert)
reviewSchema.index({ restaurant: 1, client: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);