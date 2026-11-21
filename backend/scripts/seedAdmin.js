import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

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
