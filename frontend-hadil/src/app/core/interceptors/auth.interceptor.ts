import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token();

  const request = token && req.url.startsWith('/api')
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      // Session expirée : on déconnecte, sauf pour les tentatives de login/register
      if (err.status === 401 && auth.isLoggedIn() && !req.url.includes('/api/auth/')) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
