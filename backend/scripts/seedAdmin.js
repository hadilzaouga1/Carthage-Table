import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

<<<<<<< HEAD
(async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const email = (process.env.ADMIN_EMAIL || 'admin@carthage-table.tn').toLowerCase();

  if (await User.findOne({ email })) {
    console.log(`Admin déjà présent : ${email}`);
  } else {
    await User.create({
      nom: 'Carthage',
      prenom: 'Table',
      email,
      telephone: '20000000',
      password: process.env.ADMIN_PASSWORD || 'Admin1234',
      role: 'admin',
    });
    console.log(`Admin créé : ${email}`);
  }
  await mongoose.disconnect();
})();
=======
// Comptes de test
const users = [
  { nom: 'Admin', prenom: 'Super', email: 'admin@foodexpress.tn', telephone: '20000000', password: 'Admin1234', role: 'admin' },
  { nom: 'Ben Salah', prenom: 'Karim', email: 'resto@foodexpress.tn', telephone: '21000000', password: 'Resto1234', role: 'restaurateur' }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  for (const data of users) {
    // On ne recrée pas un compte déjà existant
    if (await User.findOne({ email: data.email })) {
      console.log(`ℹ️ ${data.email} existe déjà`);
    } else {
      await User.create(data);
      console.log(`✅ ${data.role} créé : ${data.email} / ${data.password}`);
    }
  }
  await mongoose.disconnect();
}

run();
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
