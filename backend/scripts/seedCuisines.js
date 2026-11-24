import 'dotenv/config';
import mongoose from 'mongoose';
import Cuisine from '../models/Cuisine.js';

// Les cuisines proposées par défaut (relançable : une cuisine existante n'est pas recréée)
const cuisines = [
  { nom: 'Pizza', icon: 'pizza', description: 'Pizzas au feu de bois' },
  { nom: 'Fast-food', icon: 'sandwich', description: 'Burgers, sandwichs, frites' },
  { nom: 'Tunisien', icon: 'utensils', description: 'Cuisine tunisienne traditionnelle' },
  { nom: 'Italien', icon: 'utensils', description: 'Pâtes et spécialités italiennes' },
  { nom: 'Desserts', icon: 'cake-slice', description: 'Pâtisseries et douceurs' },
  { nom: 'Boissons', icon: 'utensils', description: 'Jus, cocktails et boissons fraîches' }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Cuisine.init(); // crée l'index d'unicité
    for (const data of cuisines) {
      if (await Cuisine.findOne({ nom: data.nom }).collation({ locale: 'fr', strength: 2 })) {
        console.log(`${data.nom} existe déjà`);
      } else {
        await Cuisine.create(data);
        console.log(`Cuisine créée : ${data.nom}`);
      }
    }
  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
