import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

// Un intercepteur passe sur CHAQUE requête HTTP avant son envoi.
// Ici il ajoute le token dans l'en-tête, comme on le faisait avec Postman.
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token();
  if (token) {
    // On clone la requête (elle est non modifiable) en ajoutant l'en-tête
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Token expiré ou invalide : on déconnecte proprement (sauf pendant la connexion elle-même)
      if (err.status === 401 && token && !req.url.includes('/auth/')) {
        auth.logout();
        router.navigate(['/login']);
      }
      return throwError(() => err);
    })
  );
};
