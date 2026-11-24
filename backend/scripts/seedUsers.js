import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Comptes de test pour l'application (relançable : un compte existant n'est jamais recréé)
const users = [
  { nom: 'Admin', prenom: 'Super', email: 'admin@restora.tn', telephone: '20000000', password: 'Admin1234', role: 'admin' },
  { nom: 'Ben Salah', prenom: 'Karim', email: 'resto@restora.tn', telephone: '21000000', password: 'Resto1234', role: 'restaurateur' }
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    for (const data of users) {
      // On ne recrée pas un compte déjà existant
      if (await User.findOne({ email: data.email })) {
        console.log(`${data.email} existe déjà`);
      } else {
        await User.create(data); // le mot de passe est chiffré par le modèle
        console.log(`${data.role} créé : ${data.email} / ${data.password}`);
      }
    }
  } catch (err) {
    console.error('Erreur :', err.message);
  } finally {
    await mongoose.disconnect(); // on ferme toujours la connexion
  }
}

run();