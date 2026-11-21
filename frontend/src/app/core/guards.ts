import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Role } from './models';

// Garde : seulement pour les utilisateurs connectés, sinon -> page login
export const authGuard: CanActivateFn = () => {
  if (inject(AuthService).isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login']);
};

// Garde par rôle : roleGuard('admin') ou roleGuard('restaurateur', 'admin')
// Le serveur vérifie aussi les droits : ce garde sert surtout à l'affichage
export const roleGuard = (...roles: Role[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  const role = auth.role();
  if (auth.isLoggedIn() && role && roles.includes(role)) return true;
  return inject(Router).createUrlTree(['/']);
};