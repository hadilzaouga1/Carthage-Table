import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  const resto = await User.findOne({ email: 'resto@carthage-table.tn' });
  if (!resto) throw new Error('Lancez d\'abord seedUsers.js');

  let r = await Restaurant.findOne({ nom: 'Chez Karim' });
  if (!r) {
    r = await Restaurant.create({
      nom: 'Chez Karim',
      description: 'Cuisine tunisienne authentique',
      adresse: '12 rue de Carthage, Tunis',
      typeCuisine: 'Tunisien',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
      fraisLivraison: 5,
      horaires: '11h - 23h',
      isOpen: true,
      owner: resto._id,
      status: 'valide'   
    });
    console.log('Restaurant créé et validé :', r.nom);
  }

  let cat = await Category.findOne({ restaurant: r._id, nom: 'Plats' });
  if (!cat) cat = await Category.create({ nom: 'Plats', restaurant: r._id });

  if ((await Dish.countDocuments({ restaurant: r._id })) === 0) {
    await Dish.create([
      { nom: 'Couscous', description: 'Couscous agneau', prix: 18, image: 'plats/couscous.jpg', icon: '', categorie: cat._id, restaurant: r._id, disponible: true },
      { nom: 'Brik', description: 'Brik à l\'œuf', prix: 4, image: 'plats/brik.jpg', icon: '', categorie: cat._id, restaurant: r._id, disponible: true }
    ]);
    console.log('2 plats créés');
  }

  await mongoose.disconnect();
}
run().catch((e) => { console.error(e); process.exit(1); });