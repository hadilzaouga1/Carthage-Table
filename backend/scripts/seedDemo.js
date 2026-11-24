import 'dotenv/config';
// Données de démonstration : 1 restaurateur, 8 restaurants, catégories et plats.
// Usage : npm run seed:demo   (relançable : remplace les données de démo)
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';

const DEMO = [
  { nom: 'Pizza House', typeCuisine: 'Pizza', icon: '🍕', adresse: 'Centre-ville, Tunis', fraisLivraison: 5, horaires: '10:00 - 23:00', isOpen: true,
    description: 'Pizzas cuites au feu de bois, pâte fraîche chaque matin.',
    menu: { Pizzas: [['Pizza Margherita', 'Tomate, mozzarella et basilic', 15, '🍕'], ['Pizza 4 fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 19, '🧀'], ['Pizza Thon', 'Tomate, thon, olives, câpres', 17, '🍕']],
            Boissons: [['Coca-Cola', 'Canette 33 cl', 3, '🥤'], ['Eau minérale', 'Bouteille 50 cl', 1.5, '💧']],
            Desserts: [['Tiramisu', 'Mascarpone et café, fait maison', 7, '🍰']] } },
  { nom: 'Dar Ellil', typeCuisine: 'Tunisien', icon: '🥘', adresse: 'Médina, Tunis', fraisLivraison: 4, horaires: '11:00 - 22:30', isOpen: true,
    description: 'Cuisine tunisienne familiale, plats mijotés et épices de la médina.',
    menu: { Entrées: [['Brik à l\'œuf', 'Feuille de malsouka, thon, œuf, persil', 4.5, '🥟'], ['Salade méchouia', 'Poivrons et tomates grillés, huile d\'olive', 6, '🥗']],
            'Plats principaux': [['Couscous à l\'agneau', 'Semoule fine, légumes, agneau', 22, '🍲'], ['Lablabi', 'Pois chiches, pain, harissa, œuf', 8, '🥣']],
            Desserts: [['Makroudh', 'Semoule et dattes, miel', 5, '🍯']] } },
  { nom: 'Burger Bey', typeCuisine: 'Fast-food', icon: '🍔', adresse: 'La Marsa', fraisLivraison: 3, horaires: '12:00 - 01:00', isOpen: true,
    description: 'Burgers smashés, frites maison et milkshakes.',
    menu: { Sandwichs: [['Cheeseburger', 'Steak, cheddar, oignons caramélisés', 14, '🍔'], ['Chicken Crunch', 'Poulet croustillant, salade, sauce ranch', 13, '🥪']],
            Boissons: [['Milkshake vanille', '40 cl', 7, '🥤']] } },
  { nom: 'Pasta Nonna', typeCuisine: 'Italien', icon: '🍝', adresse: 'Les Berges du Lac', fraisLivraison: 6, horaires: '11:30 - 23:00', isOpen: false,
    description: 'Pâtes fraîches et sauces mijotées comme chez la nonna.',
    menu: { 'Plats principaux': [['Spaghetti bolognaise', 'Sauce à la viande mijotée 4 h', 16, '🍝'], ['Lasagnes', 'Béchamel, bœuf, parmesan', 18, '🍝']],
            Desserts: [['Panna cotta', 'Coulis de fruits rouges', 6, '🍮']] } },
  { nom: 'Douceurs de Tunis', typeCuisine: 'Desserts', icon: '🍰', adresse: 'Sidi Bou Saïd', fraisLivraison: 4, horaires: '09:00 - 21:00', isOpen: true,
    description: 'Pâtisseries orientales et gâteaux du jour.',
    menu: { Desserts: [['Baklawa', 'Pistaches et miel, 6 pièces', 12, '🍯'], ['Millefeuille', 'Crème pâtissière vanille', 6, '🍰'], ['Assidat zgougou', 'Crème de pin d\'Alep', 5, '🍮']],
            Boissons: [['Thé à la menthe', 'Avec pignons', 3, '🍵']] } },
  { nom: 'Jus Médina', typeCuisine: 'Boissons', icon: '🥤', adresse: 'Avenue Habib Bourguiba', fraisLivraison: 2, horaires: '08:00 - 20:00', isOpen: true,
    description: 'Jus pressés minute et cocktails de fruits.',
    menu: { Boissons: [['Jus d\'orange', 'Pressé minute, 40 cl', 5, '🍊'], ['Cocktail avocat', 'Avocat, lait, dattes', 8, '🥑'], ['Citronnade menthe', 'Fraîche et peu sucrée', 4, '🍋']] } },
  { nom: 'Chez Fatma', typeCuisine: 'Tunisien', icon: '🍲', adresse: 'El Menzah 6', fraisLivraison: 5, horaires: '12:00 - 16:00', isOpen: false,
    description: 'Le déjeuner comme à la maison : ojja, chakchouka, kafteji.',
    menu: { 'Plats principaux': [['Ojja merguez', 'Œufs, tomates, poivrons, merguez', 12, '🍳'], ['Kafteji', 'Légumes frits, œuf, harissa', 9, '🍳']] } },
  { nom: 'Capri Slice', typeCuisine: 'Pizza', icon: '🍕', adresse: 'Lac 2', fraisLivraison: 5, horaires: '11:00 - 00:00', isOpen: true,
    description: 'La pizza à la coupe, croustillante et généreuse.',
    menu: { Pizzas: [['Pizza Reine', 'Jambon, champignons, mozzarella', 16, '🍕'], ['Pizza Végétarienne', 'Poivrons, olives, oignons, champignons', 15, '🍕']],
            Boissons: [['Fanta Orange', 'Canette 33 cl', 3, '🥤']] } },
];

(async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let owner = await User.findOne({ email: 'resto@restora.tn' });
  if (!owner) {
    owner = await User.create({ nom: 'Ben Salah', prenom: 'Karim', email: 'resto@restora.tn', telephone: '22111222', password: 'Resto1234', role: 'restaurateur' });
  }

  // Remplace uniquement les données appartenant au restaurateur de démo
  const old = await Restaurant.find({ owner: owner._id }).select('_id');
  const oldIds = old.map((r) => r._id);
  await Promise.all([Dish.deleteMany({ restaurant: { $in: oldIds } }), Category.deleteMany({ restaurant: { $in: oldIds } }), Restaurant.deleteMany({ _id: { $in: oldIds } })]);

  for (const { menu, ...data } of DEMO) {
        const restaurant = await Restaurant.create({ ...data, owner: owner._id, status: 'valide' }); 
        // validé d'office pour la démo
    for (const [catName, dishes] of Object.entries(menu)) {
      const category = await Category.create({ nom: catName, restaurant: restaurant._id });
      await Dish.insertMany(dishes.map(([nom, description, prix, icon], i) => ({
        nom, description, prix, icon, categorie: category._id, restaurant: restaurant._id,
        disponible: !(restaurant.nom === 'Pizza House' && nom === 'Pizza Thon'), // un plat indisponible pour la démo
      })));
    }
  }

  console.log(`Démo prête : ${DEMO.length} restaurants. Connexion restaurateur : resto@restora.tn / Resto1234`);
  await mongoose.disconnect();
})();
