import { Routes } from '@angular/router';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { Register } from './pages/register';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  // Les autres pages (restaurants, panier...) arrivent aux prochaines étapes
  { path: '**', redirectTo: '' }
];