import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';

// Chaque restaurant : ses infos + ses catégories avec leurs plats [nom, description, prix]
const data = [
  {
    resto: { nom: 'Pizza House', description: 'Restaurant spécialisé en pizzas', adresse: 'Centre-ville', typeCuisine: 'Italien', image: 'pizza-house.jpg', fraisLivraison: 5, horaires: '10:00 - 23:00', isOpen: true },
    menu: {
      Pizzas: [['Pizza Margherita', 'Tomate, mozzarella et basilic', 15], ['Pizza 4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 18]],
      Boissons: [['Coca-Cola', 'Canette 33cl', 3]],
      Desserts: [['Tiramisu', 'Dessert italien au café', 7]]
    }
  },
  {
    resto: { nom: 'Chez Mami', description: 'Cuisine tunisienne traditionnelle', adresse: 'Avenue Habib Bourguiba', typeCuisine: 'Tunisien', image: 'chez-mami.jpg', fraisLivraison: 4, horaires: '11:00 - 22:00', isOpen: true },
    menu: {
      'Plats principaux': [['Couscous Agneau', 'Couscous traditionnel avec légumes', 22], ['Ojja Merguez', 'Œufs, tomates et merguez', 14]],
      Entrées: [['Brik à l\'œuf', 'Brik croustillant', 4]],
      Boissons: [['Eau minérale', 'Bouteille 50cl', 1.5]]
    }
  },
  {
    resto: { nom: 'Burger Station', description: 'Burgers faits maison', adresse: 'Rue de la République', typeCuisine: 'Fast-food', image: 'burger-station.jpg', fraisLivraison: 6, horaires: '12:00 - 00:00', isOpen: false },
    menu: {
      Sandwichs: [['Cheese Burger', 'Steak, cheddar, salade', 12], ['Chicken Burger', 'Poulet pané, sauce maison', 11]],
      Boissons: [['Fanta', 'Canette 33cl', 3]]
    }
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // On cherche le restaurateur créé par seedAdmin.js
  const owner = await User.findOne({ email: 'resto@carthage-table.tn' });
  if (!owner) {
    console.log(" Lance d'abord : npm run seed:admin");
    return mongoose.disconnect();
  }

  // On vide les anciennes données de test pour éviter les doublons
  await Promise.all([Restaurant.deleteMany(), Category.deleteMany(), Dish.deleteMany()]);

  for (const { resto, menu } of data) {
    const restaurant = await Restaurant.create({ ...resto, owner: owner._id, status: 'valide' });
    for (const [categoryName, dishes] of Object.entries(menu)) {
      const category = await Category.create({ nom: categoryName, restaurant: restaurant._id });
      for (const [nom, description, prix] of dishes) {
        await Dish.create({ nom, description, prix, categorie: category._id, restaurant: restaurant._id });
      }
    }
    console.log(` ${restaurant.nom} créé`);
  }
  await mongoose.disconnect();
}

run();