import 'dotenv/config';
// Crée les catégories générales de cuisine (sans doublon). Relançable sans risque.
// Usage : npm run seed:cuisines
import mongoose from 'mongoose';
import Cuisine from '../models/Cuisine.js';
import { CUISINES } from './data/cuisines.js';

(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  let created = 0;
  for (const c of CUISINES) {
    const exists = await Cuisine.exists({ nom: new RegExp(`^${c.nom}$`, 'i') });
    if (!exists) { await Cuisine.create(c); created++; }
  }
  console.log(`Cuisines : ${created} créée(s), ${CUISINES.length - created} déjà présente(s).`);
  await mongoose.disconnect();
})();
