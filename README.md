<<<<<<< HEAD
# 🍽️ Carthage Table

Plateforme web de commande et de livraison de repas en Tunisie : restaurants, menus, panier, suivi de commande
et espaces client, restaurateur et administrateur. Projet **MEAN Stack** (Angular, Node.js, Express, MongoDB) avec authentification JWT.

Base de données MongoDB : `carthage_table` (adresse dans `MONGO_URI`, fichier `.env`). Backend en modules ES (`import` / `export`).

## Lancer le projet

Prérequis : Node.js 20+, MongoDB en local (ou une URI Atlas).

```bash
# Backend
cd backend
npm install
cp .env.example .env         # MONGO_URI, JWT_SECRET, PORT, JWT_EXPIRES_IN
npm run seed:admin           # admin@carthage-table.tn / Admin1234
npm run seed:demo            # 8 restaurants + menus, restaurateur resto@carthage-table.tn / Resto1234
npm run dev                  # http://localhost:5000/api/health

# Frontend (autre terminal)
cd frontend
npm install
npm start                    # http://localhost:4200
```

## API

Règles appliquées : un restaurateur ne gère que **ses** restaurants (vérifié côté serveur), seuls les restaurants
`approved` sont visibles du public, une catégorie ne peut être supprimée tant qu'elle contient des plats,
un plat ne peut appartenir qu'à une catégorie du même restaurant.

## Design

Inspiré de l'app Costra : crème `#FBF5E1`, indigo `#4A4A8C`, brun café `#8A5A2B`.
Titres en Fraunces, texte en DM Sans, accents manuscrits en Caveat. Cartes très arrondies, boutons pilule.
Jetons de design dans `frontend/src/styles.scss`.
=======
# Carthage-Table
Plateforme web de commande et de livraison de repas en Tunisie : restaurants, menus, panier, suivi de commande et espaces client, restaurateur et administrateur. Projet MEAN Stack (Angular, Node.js, Express, MongoDB) avec authentification JWT.
>>>>>>> 5020dc1c153867e4f1f816fe84909869b90fd0a4
