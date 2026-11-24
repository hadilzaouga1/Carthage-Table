import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';

// Comptes de test pour ton application
const users = [
  { 
    nom: 'Admin', 
    prenom: 'Super', 
    email: 'admin@restora.tn', 
    telephone: '20000000', 
    password: 'Admin1234', 
    role: 'admin' 
  },
  { 
    nom: 'Ben Salah', 
    prenom: 'Karim', 
    email: 'resto@restora.tn', 
    telephone: '21000000', 
    password: 'Resto1234', 
    role: 'restaurateur' 
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  for (const data of users) {
    // On ne recrée pas un compte déjà existant
    if (await User.findOne({ email: data.email })) {
      console.log(` ${data.email} existe déjà`);
    } else {
      await User.create(data);
      console.log(` ${data.role} créé : ${data.email} / ${data.password}`);
    }
  }
  
  await mongoose.disconnect();
}

run();