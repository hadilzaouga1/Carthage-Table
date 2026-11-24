import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // Active le système de pages (les routes) + remonte en haut à chaque changement de page
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top' })),
    // Active les appels HTTP + notre intercepteur qui ajoute le token
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};