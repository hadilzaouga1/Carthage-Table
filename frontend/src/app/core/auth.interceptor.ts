import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

// Un intercepteur passe sur CHAQUE requête HTTP avant son envoi.
// Ici il ajoute le token dans l'en-tête, comme on le faisait avec Postman.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  if (token) {
    // On clone la requête (elle est non modifiable) en ajoutant l'en-tête
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};