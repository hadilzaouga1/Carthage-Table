import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Register } from './pages/register';
import { Restaurants } from './pages/restaurants';
import { RestaurantDetail } from './pages/restaurant-detail';
import { Cart } from './pages/cart';
import { Orders } from './pages/orders';
import { Restaurateur } from './pages/restaurateur';
import { MenuManager } from './pages/menu-manager';
import { Admin } from './pages/admin';
import { Profile } from './pages/profile';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'restaurants', component: Restaurants },
  { path: 'restaurants/:id', component: RestaurantDetail },
  { path: 'panier', component: Cart },
  { path: 'commandes', component: Orders, canActivate: [authGuard] },
  { path: 'profil', component: Profile, canActivate: [authGuard] },
  { path: 'restaurateur', component: Restaurateur, canActivate: [roleGuard('restaurateur')] },
  // Le menu est l'affaire du restaurateur : l'admin n'y a pas accès
  { path: 'restaurateur/menu', component: MenuManager, canActivate: [roleGuard('restaurateur')] },
  { path: 'admin', component: Admin, canActivate: [roleGuard('admin')] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // Cette route doit rester TOUJOURS en dernier : elle attrape toutes les URL inconnues
  { path: '**', redirectTo: '' }
];