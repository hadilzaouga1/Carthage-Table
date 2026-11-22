import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './config';
import { AuthService } from './auth.service';

const FAV_KEY = 'ct_favorites';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);

  ids = signal<string[]>(this.readLocal());
  count = computed(() => this.ids().length);

  constructor() {
    // Réagit automatiquement à la connexion / déconnexion sans dépendance circulaire
    effect(() => {
      const user = this.auth.user();
      if (user) {
        this.syncFromServer();
      } else {
        this.ids.set([]);
        localStorage.removeItem(FAV_KEY);
      }
    });
  }

  private readLocal(): string[] {
    try {
      const raw = JSON.parse(localStorage.getItem(FAV_KEY) || '[]');
      return Array.isArray(raw) ? raw.map(String) : [];
    } catch {
      return [];
    }
  }

  isFavorite(restaurantId: string): boolean {
    return this.ids().includes(String(restaurantId));
  }

  toggle(restaurantId: string) {
    const id = String(restaurantId);
    const exists = this.ids().includes(id);
    const next = exists ? this.ids().filter((x) => x !== id) : [...this.ids(), id];
    this.ids.set(next);
    this.persist();

    if (!this.auth.isLoggedIn()) return;

    this.http.post<{ success: boolean; favorites?: string[] }>(`${API_URL}/users/favorites/${id}`, {}).subscribe({
      next: (res) => {
        if (Array.isArray(res?.favorites)) {
          this.ids.set(res.favorites.map(String));
          this.persist();
        }
      },
      error: () => {
        // En cas d'échec réseau/serveur, on recharge l'état réel depuis le serveur
        this.syncFromServer();
      }
    });
  }

  syncFromServer() {
    if (!this.auth.isLoggedIn()) return;
    this.http.get<{ success: boolean; favorites?: string[] }>(`${API_URL}/users/favorites`).subscribe({
      next: (res) => {
        if (Array.isArray(res?.favorites)) {
          this.ids.set(res.favorites.map(String));
          this.persist();
        }
      },
      error: () => {}
    });
  }

  private persist() {
    localStorage.setItem(FAV_KEY, JSON.stringify(this.ids()));
  }
}