// Service qui parle à l'API pour les restaurants (GET /api/restaurants et /api/restaurants/:id).
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
  icon?: string;
  fraisLivraison: number;
  horaires: string;
  isOpen: boolean;
}
// Une catégorie du menu (Pizzas, Boissons...)
export interface Category { _id: string; nom: string; }
// Un plat du menu
export interface Dish {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  icon: string;
  image?: string;    // photo du plat (nom de fichier dans public/img ou lien https)
  disponible: boolean;
  categorie: string; // id de la catégorie
}
// Réponse paginée du backend
export interface RestaurantPage { restaurants: Restaurant[]; total: number; page: number; pages: number; }
// Réponse de GET /api/restaurants/:id : le restaurant + son menu
export interface RestaurantMenu { restaurant: Restaurant; categories: Category[]; dishes: Dish[]; }

@Injectable({ providedIn: 'root' })
export class RestaurantService {
  private http = inject(HttpClient); // client HTTP d'Angular

  // Liste avec recherche / filtre de cuisine / ouverts seulement / page
  list(options: { search?: string; typeCuisine?: string; open?: boolean; sort?: 'asc' | 'desc'; page?: number; limit?: number } = {}): Observable<RestaurantPage> {
    let params = new HttpParams();
    if (options.search) params = params.set('search', options.search);
    if (options.typeCuisine) params = params.set('typeCuisine', options.typeCuisine);
    if (options.open) params = params.set('open', 'true');
    if (options.sort === 'desc') params = params.set('sort', 'desc'); // Z→A (A→Z par défaut)
    if (options.page) params = params.set('page', options.page);
    if (options.limit) params = params.set('limit', options.limit);
    return this.http.get<RestaurantPage>(`${API_URL}/restaurants`, { params });
  }

  // Un restaurant avec ses catégories et ses plats
  getOne(id: string): Observable<RestaurantMenu> {
    return this.http.get<RestaurantMenu>(`${API_URL}/restaurants/${id}`);
  }
}