import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';

// Chaque restaurant : ses infos + ses catégories avec leurs plats [nom, description, prix, image]
const data = [
  {
    resto: { nom: 'Pizza House', description: 'Restaurant spécialisé en pizzas', adresse: 'Centre-ville', typeCuisine: 'Italien', image: 'pizza-house.jpg', fraisLivraison: 5, horaires: '10:00 - 23:00', isOpen: true },
    menu: {
      Pizzas: [['Pizza Margherita', 'Tomate, mozzarella et basilic', 15, 'plats/pizza-margherita.jpg'], ['Pizza 4 Fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 18, 'plats/pizza-4-fromages.jpg']],
      Boissons: [['Coca-Cola', 'Canette 33cl', 3, 'plats/booga.jpg']],
      Desserts: [['Tiramisu', 'Dessert italien au café', 7, 'plats/tiramisu.jpg']]
    }
  },
  {
    resto: { nom: 'Chez Mami', description: 'Cuisine tunisienne traditionnelle', adresse: 'Avenue Habib Bourguiba', typeCuisine: 'Tunisien', image: 'chez-mami.jpg', fraisLivraison: 4, horaires: '11:00 - 22:00', isOpen: true },
    menu: {
      'Plats principaux': [['Couscous Agneau', 'Couscous traditionnel avec légumes', 22, 'plats/couscous.jpg'], ['Ojja Merguez', 'Œufs, tomates et merguez', 14, 'plats/ojja-merguez.jpg']],
      Entrées: [['Brik à l\'œuf', 'Brik croustillant', 4, 'plats/brik.jpg']],
      Boissons: [['Eau minérale', 'Bouteille 50cl', 1.5, 'plats/eau-minerale.jpg']]
    }
  },
  {
    resto: { nom: 'Burger Station', description: 'Burgers faits maison', adresse: 'Rue de la République', typeCuisine: 'Fast-food', image: 'burger.jpg', fraisLivraison: 6, horaires: '12:00 - 00:00', isOpen: false },
    menu: {
      Sandwichs: [['Cheese Burger', 'Steak, cheddar, salade', 12, 'plats/cheeseburger.jpg'], ['Chicken Burger', 'Poulet pané, sauce maison', 11, 'plats/chicken-burger.jpg']],
      Boissons: [['Fanta', 'Canette 33cl', 3, 'plats/boogaB.jpg']]
    }
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI);

  // On cherche le restaurateur créé par seedAdmin.js
  const owner = await User.findOne({ email: 'resto@restora.tn' });
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
      for (const [nom, description, prix, image] of dishes) {
        await Dish.create({ nom, description, prix, image, icon: '', categorie: category._id, restaurant: restaurant._id });
      }
    }
    console.log(` ${restaurant.nom} créé`);
  }
  await mongoose.disconnect();
}

run();