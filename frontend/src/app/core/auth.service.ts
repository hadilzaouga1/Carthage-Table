import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './config';
import { AuthResponse, User } from './models';

// Noms des clés dans le localStorage du navigateur
const TOKEN_KEY = 'ct_token';
const USER_KEY = 'ct_user';

// providedIn: 'root' = un seul service partagé par toute l'application
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);   // pour appeler l'API
  private router = inject(Router);     // pour changer de page

  // signal = une valeur qui prévient l'écran quand elle change
  // On relit le localStorage au démarrage : l'utilisateur reste connecté après F5
  token = signal<string | null>(localStorage.getItem(TOKEN_KEY));
  user = signal<User | null>(this.readUser());

  // Valeurs calculées automatiquement à partir des signals ci-dessus
  isLoggedIn = computed(() => !!this.token());
  role = computed(() => this.user()?.role ?? null);

  // Lit l'utilisateur sauvegardé (null si absent ou corrompu)
  private readUser(): User | null {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
    } catch {
      return null;
    }
  }

  // Sauvegarde le token et l'utilisateur après connexion
  private save(res: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    this.token.set(res.token);
    this.user.set(res.user);
  }

  // POST /api/auth/register
  register(data: Record<string, string>) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/register`, data).pipe(tap((res) => this.save(res)));
  }

  // POST /api/auth/login
  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(tap((res) => this.save(res)));
  }

  // Déconnexion : on efface tout et on retourne à l'accueil
  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.token.set(null);
    this.user.set(null);
    this.router.navigate(['/']);
  }
}