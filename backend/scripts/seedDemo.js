import 'dotenv/config';
// Données de démonstration : 1 restaurateur, 8 restaurants, catégories et plats.
// Usage : npm run seed:demo   (relançable : remplace les données de démo)
import mongoose from 'mongoose';
import User from '../models/User.js';
import Restaurant from '../models/Restaurant.js';
import Category from '../models/Category.js';
import Dish from '../models/Dish.js';

const DEMO = [
  { nom: 'Pizza House', typeCuisine: 'Pizza', icon: '🍕', image: 'img/pizza-house.jpg', adresse: 'Centre-ville, Tunis', fraisLivraison: 5, horaires: '10:00 - 23:00', isOpen: true,
    description: 'Pizzas cuites au feu de bois, pâte fraîche chaque matin.',
    menu: { Pizzas: [['Pizza Margherita', 'Tomate, mozzarella et basilic', 15, 'plats/pizza-margherita.jpg'], ['Pizza 4 fromages', 'Mozzarella, gorgonzola, parmesan, chèvre', 19, 'plats/pizza-4-fromages.jpg'], ['Pizza Thon', 'Tomate, thon, olives, câpres', 17, 'plats/pizza-thon.jpg']],
            Boissons: [['Coca-Cola', 'Canette 33 cl', 3, 'plats/booga.jpg'], ['Eau minérale', 'Bouteille 50 cl', 1.5, 'plats/eau-minerale.jpg']],
            Desserts: [['Tiramisu', 'Mascarpone et café, fait maison', 7, 'plats/tiramisu.jpg']] } },
  { nom: 'Dar Ellil', typeCuisine: 'Tunisien', icon: '🥘', image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?w=800', adresse: 'Médina, Tunis', fraisLivraison: 4, horaires: '11:00 - 22:30', isOpen: true,
    description: 'Cuisine tunisienne familiale, plats mijotés et épices de la médina.',
    menu: { Entrées: [['Brik à l\'œuf', 'Feuille de malsouka, thon, œuf, persil', 4.5, 'plats/brik.jpg'], ['Salade méchouia', 'Poivrons et tomates grillés, huile d\'olive', 6, 'plats/salade-mechouia.jpg']],
            'Plats principaux': [['Couscous à l\'agneau', 'Semoule fine, légumes, agneau', 22, 'plats/couscous.jpg'], ['Lablabi', 'Pois chiches, pain, harissa, œuf', 8, 'plats/lablabi.jpg']],
            Desserts: [['Makroudh', 'Semoule et dattes, miel', 5, 'plats/makroudh.jpg']] } },
  { nom: 'Burger Bey', typeCuisine: 'Fast-food', icon: '🍔', image: 'img/burger.jpg', adresse: 'La Marsa', fraisLivraison: 3, horaires: '12:00 - 01:00', isOpen: true,
    description: 'Burgers smashés, frites maison et milkshakes.',
    menu: { Sandwichs: [['Cheeseburger', 'Steak, cheddar, oignons caramélisés', 14, 'plats/cheeseburger.jpg'], ['Chicken Crunch', 'Poulet croustillant, salade, sauce ranch', 13, 'plats/chicken-burger.jpg']],
            Boissons: [['Milkshake vanille', '40 cl', 7, 'plats/milkshake-vanille.jpg']] } },
  { nom: 'Pasta Nonna', typeCuisine: 'Italien', icon: '🍝', image: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=800', adresse: 'Les Berges du Lac', fraisLivraison: 6, horaires: '11:30 - 23:00', isOpen: false,
    description: 'Pâtes fraîches et sauces mijotées comme chez la nonna.',
    menu: { 'Plats principaux': [['Spaghetti bolognaise', 'Sauce à la viande mijotée 4 h', 16, 'plats/spaghetti-bolognaise.jpg'], ['Lasagnes', 'Béchamel, bœuf, parmesan', 18, 'plats/lasagnes.jpg']],
            Desserts: [['Panna cotta', 'Coulis de fruits rouges', 6, 'plats/panna-cotta.jpg']] } },
  { nom: 'Douceurs de Tunis', typeCuisine: 'Desserts', icon: '🍰', image: 'img/dessert.jpg', adresse: 'Sidi Bou Saïd', fraisLivraison: 4, horaires: '09:00 - 21:00', isOpen: true,
    description: 'Pâtisseries orientales et gâteaux du jour.',
    menu: { Desserts: [['Baklawa', 'Pistaches et miel, 6 pièces', 12, 'plats/baklawa.jpg'], ['Millefeuille', 'Crème pâtissière vanille', 6, 'plats/millefeuille.jpg'], ['Assidat zgougou', 'Crème de pin d\'Alep', 5, 'plats/assidat-zgougou.jpg']],
            Boissons: [['Thé à la menthe', 'Avec pignons', 3, 'plats/the-menthe.jpg']] } },
  { nom: 'Jus Médina', typeCuisine: 'Boissons', icon: '🥤', image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800', adresse: 'Avenue Habib Bourguiba', fraisLivraison: 2, horaires: '08:00 - 20:00', isOpen: true,
    description: 'Jus pressés minute et cocktails de fruits.',
    menu: { Boissons: [['Jus d\'orange', 'Pressé minute, 40 cl', 5, 'plats/jus-orange.jpg'], ['Cocktail avocat', 'Avocat, lait, dattes', 8, 'plats/cocktail-avocat.jpg'], ['Citronnade menthe', 'Fraîche et peu sucrée', 4, 'plats/citronnade.jpg']] } },
  { nom: 'Chez Fatma', typeCuisine: 'Tunisien', icon: '🍲', image: 'img/chez-mami.jpg', adresse: 'El Menzah 6', fraisLivraison: 5, horaires: '12:00 - 16:00', isOpen: false,
    description: 'Le déjeuner comme à la maison : ojja, chakchouka, kafteji.',
    menu: { 'Plats principaux': [['Ojja merguez', 'Œufs, tomates, poivrons, merguez', 12, 'plats/ojja-merguez.jpg'], ['Kafteji', 'Légumes frits, œuf, harissa', 9, 'plats/kafteji.jpg']] } },
  { nom: 'Capri Slice', typeCuisine: 'Pizza', icon: '🍕', image: 'img/pizzeria.jpg', adresse: 'Lac 2', fraisLivraison: 5, horaires: '11:00 - 00:00', isOpen: true,
    description: 'La pizza à la coupe, croustillante et généreuse.',
    menu: { Pizzas: [['Pizza Reine', 'Jambon, champignons, mozzarella', 16, 'plats/pizza-reine.jpg'], ['Pizza Végétarienne', 'Poivrons, olives, oignons, champignons', 15, 'plats/pizza-vegetarienne.jpg']],
            Boissons: [['Fanta Orange', 'Canette 33 cl', 3, 'plats/boogaB.jpg']] } },
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
      await Dish.insertMany(dishes.map(([nom, description, prix, image]) => ({
        nom, description, prix, image, icon: '', categorie: category._id, restaurant: restaurant._id,
        disponible: !(restaurant.nom === 'Pizza House' && nom === 'Pizza Thon'), // un plat indisponible pour la démo
      })));
    }
  }

  console.log(`Démo prête : ${DEMO.length} restaurants. Connexion restaurateur : resto@restora.tn / Resto1234`);
  await mongoose.disconnect();
})();
