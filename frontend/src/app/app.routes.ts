import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { RestaurantsComponent } from './pages/restaurants/restaurants.component';
import { RestaurantDetailsComponent } from './pages/restaurant-details/restaurant-details.component';
import { ComingSoonComponent } from './pages/coming-soon/coming-soon.component';
import { guestGuard, roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'Carthage Table – Commandez, savourez' },
  { path: 'restaurants', component: RestaurantsComponent, title: 'Restaurants – Carthage Table' },
  { path: 'restaurants/:id', component: RestaurantDetailsComponent, title: 'Menu – Carthage Table' },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard], title: 'Connexion – Carthage Table' },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard], title: 'Créer un compte – Carthage Table' },
  {
    path: 'restaurant-dashboard', component: ComingSoonComponent, canActivate: [roleGuard('restaurateur')],
    data: { title: 'Espace restaurateur' }, title: 'Mon restaurant – Carthage Table',
  },
  {
    path: 'admin-dashboard', component: ComingSoonComponent, canActivate: [roleGuard('admin')],
    data: { title: 'Espace administrateur' }, title: 'Administration – Carthage Table',
  },
  { path: '**', redirectTo: '' },
];
