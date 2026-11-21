#!/usr/bin/env bash
# Historique Git de Carthage Table (Parties 1 et 2).
# Sûr à relancer sur un dépôt existant : un commit n'est créé que s'il y a des changements.
# Usage (à la racine du dépôt) : bash setup-git.sh
set -e
[ -d .git ] || git init -b main

c() {
  msg="$1"; shift
  git add -A -- "$@" 2>/dev/null || true
  if git diff --cached --quiet; then echo "• (rien à commiter) $msg"; else git commit -q -m "$msg" && echo "✔ $msg"; fi
}

# ===== Partie 1 : socle =====
c "chore: initialise le dépôt (.gitignore)" .gitignore
# Le backend de la partie 1 n'est recréé que s'il n'existe pas déjà dans le dépôt
if [ -z "$(git ls-files backend/package.json 2>/dev/null)" ]; then
c "chore(backend): initialise le projet Express (modules ES) et ses dépendances" backend/package.json backend/.env.example
c "feat(backend): ajoute la connexion MongoDB (connectDB) et le modèle User" backend/config backend/models/User.js
c "feat(backend): ajoute les middlewares JWT, rôles, validation et erreurs" backend/middleware
c "feat(backend): ajoute l'authentification et la gestion du profil" backend/controllers/authController.js backend/controllers/userController.js backend/routes/authRoutes.js backend/routes/userRoutes.js
fi
# Alignement d'un backend existant sur le reste du projet (sans effet sur un dépôt neuf)
c "refactor(backend): aligne le socle sur les modules ES et la variable MONGO_URI" backend/package.json backend/.env.example backend/config backend/models/User.js backend/middleware backend/controllers/authController.js backend/controllers/userController.js backend/routes/authRoutes.js backend/routes/userRoutes.js
c "chore(frontend): initialise le workspace Angular 19 avec proxy vers l'API" frontend/package.json frontend/angular.json frontend/tsconfig.json frontend/tsconfig.app.json frontend/proxy.conf.json frontend/public frontend/src/index.html
c "style(frontend): ajoute le design system Carthage Table (palette, typo, boutons, formulaires)" frontend/src/styles.scss
c "feat(frontend): ajoute AuthService, intercepteur JWT, guards et modèle User" frontend/src/app/core/models/user.model.ts frontend/src/app/core/services/auth.service.ts frontend/src/app/core/interceptors frontend/src/app/core/guards
c "feat(frontend): ajoute le logo, la navbar responsive et le footer" frontend/src/app/shared/logo frontend/src/app/shared/navbar frontend/src/app/shared/footer
c "feat(frontend): ajoute les pages de connexion et d'inscription" frontend/src/app/pages/login frontend/src/app/pages/register frontend/src/app/pages/coming-soon

# ===== Partie 2 : restaurants, catégories, plats =====
c "feat(backend): ajoute les modèles Restaurant, Category et Dish" backend/models/Restaurant.js backend/models/Category.js backend/models/Dish.js
c "feat(backend): ajoute le contrôle de propriété (un restaurateur gère ses restaurants)" backend/utils
c "feat(backend): ajoute l'API restaurants (recherche, filtres, tri A-Z, pagination)" backend/controllers/restaurantController.js backend/routes/restaurantRoutes.js
c "feat(backend): ajoute l'API catégories et plats avec règles de gestion" backend/controllers/categoryController.js backend/controllers/dishController.js backend/routes/categoryRoutes.js backend/routes/dishRoutes.js
c "feat(backend): branche les nouvelles routes et ajoute le seed de démonstration" backend/server.js backend/scripts backend/package.json
c "feat(frontend): ajoute les modèles et le RestaurantService" frontend/src/app/core/models/restaurant.model.ts frontend/src/app/core/models/cuisines.ts frontend/src/app/core/services/restaurant.service.ts
c "feat(frontend): ajoute la carte restaurant et les onglets de cuisine" frontend/src/app/shared/restaurant-card frontend/src/app/shared/cuisine-tabs
c "feat(frontend): ajoute la page liste des restaurants (recherche, filtres, pagination)" frontend/src/app/pages/restaurants
c "feat(frontend): ajoute la page menu d'un restaurant (catégories, plats, indisponibles)" frontend/src/app/pages/restaurant-details
c "feat(frontend): branche l'accueil sur l'API et ajoute le routage" frontend/src/app/pages/home frontend/src/app/app.routes.ts frontend/src/app/app.config.ts frontend/src/app/app.component.ts frontend/src/main.ts
c "docs: met à jour le README (parties 1 et 2, API, lancement)" README.md setup-git.sh

git tag -f -a v0.2.0 -m "Partie 2 : restaurants, catégories et plats" >/dev/null
echo; echo "Historique :"; git log --oneline | head -30
