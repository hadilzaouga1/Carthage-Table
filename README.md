# 🍽️ Carthage Table

Plateforme web de commande et de livraison de repas en Tunisie : restaurants, menus, panier, suivi de commande
et espaces client, restaurateur et administrateur. Projet **MEAN Stack** (Angular, Node.js, Express, MongoDB) avec authentification JWT.

Base de données MongoDB : `foodexpress` (adresse dans `MONGO_URI`, fichier `.env`). Backend en modules ES (`import` / `export`).

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

Base URL : `http://localhost:5000/api`

### Santé
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Vérification de l'état opérationnel de l'API |

### Authentification (`/auth`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Inscription d'un nouveau compte client |
| `POST` | `/auth/login` | Public | Connexion utilisateur (retourne le token JWT et les informations de profil) |

### Utilisateurs (`/users`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/users/profile` | Connecté | Consulter les informations de son profil |
| `PUT` | `/users/profile` | Connecté | Mettre à jour ses informations de profil (nom, prénom, téléphone, adresse) |
| `PUT` | `/users/password` | Connecté | Modifier son mot de passe |
| `GET` | `/users/favorites` | Connecté | Liste des identifiants des restaurants favoris |
| `GET` | `/users/favorites/restaurants` | Connecté | Liste détaillée des restaurants favoris |
| `POST` | `/users/favorites/:restaurantId` | Connecté | Ajouter ou retirer un restaurant des favoris |
| `GET` | `/users` | Admin | Liste des utilisateurs avec recherche, tri et pagination |
| `PUT` | `/users/:id/status` | Admin | Activer ou désactiver un compte utilisateur |
| `PUT` | `/users/:id/role` | Admin | Modifier le rôle d'un utilisateur (`client`, `restaurateur`, `admin`) |

### Restaurants (`/restaurants`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/restaurants` | Public | Liste des restaurants validés (recherche, filtre cuisine, ouvert, tri, pagination) |
| `GET` | `/restaurants/mine` | Restaurateur, Admin | Liste des restaurants de l'utilisateur connecté |
| `GET` | `/restaurants/all` | Admin | Liste de tous les restaurants quel que soit leur statut (`valide`, `en_attente`, `suspendu`) |
| `GET` | `/restaurants/:id` | Public | Détails d'un restaurant validé avec ses catégories et ses plats |
| `POST` | `/restaurants` | Restaurateur, Admin | Créer un restaurant (`en_attente` pour un restaurateur, `valide` pour un admin) |
| `PUT` | `/restaurants/:id` | Restaurateur, Admin | Modifier les informations d'un restaurant (seul l'admin peut modifier le statut) |
| `DELETE` | `/restaurants/:id` | Restaurateur, Admin | Supprimer un restaurant (refusé avec code 400 si des commandes y sont associées) |

### Catégories (`/categories`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/categories` | Public | Liste des catégories d'un restaurant (`?restaurant=ID`) |
| `POST` | `/categories` | Restaurateur, Admin | Créer une catégorie rattachée à son restaurant |
| `PUT` | `/categories/:id` | Restaurateur, Admin | Modifier une catégorie de son restaurant |
| `DELETE` | `/categories/:id` | Restaurateur, Admin | Supprimer une catégorie (refusé si elle contient encore des plats) |

### Plats (`/dishes`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/dishes` | Public (optionnel Restaurateur / Admin) | Liste des plats (filtrée sur les restaurants validés ; le propriétaire et l'admin accèdent à leurs plats en attente ; pagination optionnelle avec `page` et `limit`) |
| `POST` | `/dishes` | Restaurateur, Admin | Créer un plat dans son restaurant et sa catégorie |
| `PUT` | `/dishes/:id` | Restaurateur, Admin | Modifier un plat (nom, description, prix, image, disponibilité, catégorie) |
| `DELETE` | `/dishes/:id` | Restaurateur, Admin | Supprimer un plat de son restaurant |

### Commandes (`/orders`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `POST` | `/orders` | Client | Passer une commande (calcul serveur, vérification des plats et du code promo) |
| `GET` | `/orders/my-orders` | Client | Liste et suivi des commandes du client connecté |
| `GET` | `/orders/restaurant` | Restaurateur, Admin | Commandes reçues par les restaurants du restaurateur (`?statut=`) |
| `GET` | `/orders/stats` | Restaurateur, Admin | Statistiques de vente et chiffre d'affaires du restaurateur |
| `GET` | `/orders/:id` | Client, Restaurateur, Admin | Détails d'une commande (accès sécurisé au client émetteur, restaurateur concerné ou admin) |
| `PUT` | `/orders/:id/status` | Client, Restaurateur, Admin | Faire évoluer le statut d'une commande selon les transitions autorisées du cycle de vie |

### Administration (`/admin`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/admin/stats` | Admin | Statistiques globales (clients, restaurants, commandes, chiffre d'affaires total) |
| `GET` | `/admin/orders/today` | Admin | Commandes du jour et total des ventes de la journée |

### Types de cuisine (`/cuisines`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/cuisines` | Public | Liste complète des types de cuisine disponibles |
| `POST` | `/cuisines` | Admin | Ajouter un nouveau type de cuisine |
| `PUT` | `/cuisines/:id` | Admin | Renommer un type de cuisine |
| `DELETE` | `/cuisines/:id` | Admin | Supprimer un type de cuisine inutilisé |

### Avis et Évaluations (`/reviews`)
| Méthode | Endpoint | Rôle autorisé | Description |
|---|---|---|---|
| `GET` | `/reviews/latest` | Public | Liste des derniers avis déposés |
| `GET` | `/reviews/restaurant/:restaurantId` | Public | Liste des avis et note moyenne d'un restaurant |
| `POST` | `/reviews` | Connecté (Client) | Déposer ou modifier son avis et sa note (1 à 5 étoiles) |
| `DELETE` | `/reviews/:id` | Connecté (Auteur ou Admin) | Supprimer un avis |

## Design

Inspiré de l'app Costra : crème `#FBF5E1`, indigo `#4A4A8C`, brun café `#8A5A2B`.
Titres en Fraunces, texte en DM Sans, accents manuscrits en Caveat. Cartes très arrondies, boutons pilule.
Jetons de design dans `frontend/src/styles.scss`.
