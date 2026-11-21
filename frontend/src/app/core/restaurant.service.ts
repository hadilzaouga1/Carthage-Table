// Service qui parle à l'API pour les restaurants (GET /api/restaurants).
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from './config';

// Un restaurant tel que renvoyé par notre backend (voir models/Restaurant.js)
export interface Restaurant {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  typeCuisine: string;
  image: string;
  fraisLivraison: number;
  horaires: string;
  isOpen: boolean;
}
// Réponse paginée du backend
export interface RestaurantPage { restaurants: Restaurant[]; total: number; page: number; pages: number; }

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private http = inject(HttpClient); // client HTTP d'Angular

  // Liste avec recherche / filtre de cuisine / ouverts seulement / page
  list(options: { search?: string; typeCuisine?: string; open?: boolean; page?: number; limit?: number } = {}): Observable<RestaurantPage> {
    let params = new HttpParams();
    if (options.search) params = params.set('search', options.search);
    if (options.typeCuisine) params = params.set('typeCuisine', options.typeCuisine);
    if (options.open) params = params.set('open', 'true');
    if (options.page) params = params.set('page', options.page);
    if (options.limit) params = params.set('limit', options.limit);
    return this.http.get<RestaurantPage>(`${API_URL}/restaurants`, { params });
  }
}