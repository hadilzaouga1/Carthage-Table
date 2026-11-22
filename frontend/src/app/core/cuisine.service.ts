// Service des catégories de cuisine (Pizza, Tunisien, Fast-food...) gérées par l'administrateur.
import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { API_URL } from './config';

export interface Cuisine {
  _id: string;
  nom: string;
  description?: string;
  icon?: string;
}

// Liste de secours si l'API ne répond pas (mêmes noms que les données de démonstration)
const FALLBACK: Cuisine[] = ['Pizza', 'Italien', 'Tunisien', 'Fast-food', 'Desserts', 'Boissons'].map((nom) => ({ _id: nom, nom }));

@Injectable({ providedIn: 'root' })
export class CuisineService {
  private http = inject(HttpClient);

  // Liste partagée par l'accueil, la liste des restaurants et les formulaires
  cuisines = signal<Cuisine[]>(FALLBACK);

  // GET /api/cuisines (public) : recharge la liste partagée
  load() {
    return this.http.get<{ success: boolean; cuisines: Cuisine[] }>(`${API_URL}/cuisines`).pipe(
      map((r) => r.cuisines),
      tap((list) => { if (list.length) this.cuisines.set(list); })
    );
  }

  // Les 3 méthodes suivantes sont réservées à l'admin (vérifié par le serveur)
  create(body: { nom: string; description?: string; icon?: string }) {
    return this.http.post(`${API_URL}/cuisines`, body);
  }
  update(id: string, body: Partial<Cuisine>) {
    return this.http.put(`${API_URL}/cuisines/${id}`, body);
  }
  remove(id: string) {
    return this.http.delete(`${API_URL}/cuisines/${id}`);
  }
}
