import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Crée un compte administrateur (à lancer une seule fois)
async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // Si l'admin existe déjà, on ne le recrée pas
  const exists = await User.findOne({ email: 'admin@foodexpress.tn' });
  if (exists) {
    console.log('ℹ️ Admin déjà existant');
  } else {
    await User.create({
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@foodexpress.tn',
      telephone: '20000000',
      password: 'Admin1234',
      role: 'admin'
    });
    console.log('✅ Admin créé : admin@foodexpress.tn / Admin1234');
  }
  await mongoose.disconnect();
}

run();