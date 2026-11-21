import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthResponse, LoginPayload, RegisterPayload, Role, User } from '../models/user.model';

const STORAGE_KEY = 'carthage_table_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _token = signal<string | null>(null);
  private _user = signal<User | null>(null);

  readonly token = this._token.asReadonly();
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => !!this._token());
  readonly role = computed<Role | null>(() => this._user()?.role ?? null);

  constructor() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { token: string; user: User };
        this._token.set(saved.token);
        this._user.set(saved.user);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  register(payload: RegisterPayload) {
    return this.http.post<AuthResponse>('/api/auth/register', payload).pipe(tap((r) => this.save(r)));
  }

  login(payload: LoginPayload) {
    return this.http.post<AuthResponse>('/api/auth/login', payload).pipe(tap((r) => this.save(r)));
  }

  logout() {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigateByUrl('/');
  }

  /** Espace correspondant au rôle (cahier des charges 3.2). */
  homeRoute(role: Role | null = this.role()): string {
    switch (role) {
      case 'admin': return '/admin-dashboard';
      case 'restaurateur': return '/restaurant-dashboard';
      default: return '/';
    }
  }

  private save(r: AuthResponse) {
    this._token.set(r.token);
    this._user.set(r.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: r.token, user: r.user }));
  }
}
