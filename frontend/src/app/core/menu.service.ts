// Service du restaurateur : ses restaurants, ses catégories et ses plats (CRUD).
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_URL } from './config';

export interface MyRestaurant {
  _id: string; nom: string; status?: string; isOpen: boolean;
  description?: string; adresse?: string; typeCuisine?: string; horaires?: string; fraisLivraison?: number; image?: string;
}
export interface Cat { _id: string; nom: string; }
export interface MenuDish { _id: string; nom: string; description: string; prix: number; icon: string; image?: string; disponible: boolean; categorie: string; }

@Injectable({ providedIn: 'root' })
export class MenuService {
  private http = inject(HttpClient);

  // GET /api/restaurants/mine : mes restaurants (même ceux en attente de validation)
  myRestaurants() {
    return this.http.get<any>(`${API_URL}/restaurants/mine`).pipe(map((r) => (r.restaurants ?? r.items ?? []) as MyRestaurant[]));
  }
  // POST /api/restaurants : le restaurant est créé « en attente », l'admin doit le valider
  createRestaurant(body: { nom: string; adresse: string; typeCuisine: string; fraisLivraison: number }) {
    return this.http.post(`${API_URL}/restaurants`, body);
  }
  // PUT /api/restaurants/:id : modifier les informations de SON restaurant
  updateRestaurant(id: string, body: Partial<Pick<MyRestaurant, 'nom' | 'description' | 'adresse' | 'typeCuisine' | 'horaires' | 'fraisLivraison' | 'image'>>) {
    return this.http.put(`${API_URL}/restaurants/${id}`, body);
  }
  // PUT /api/restaurants/:id : ouvrir / fermer le restaurant
  setOpen(id: string, isOpen: boolean) {
    return this.http.put(`${API_URL}/restaurants/${id}`, { isOpen });
  }

  // --- Catégories ---
  categories(restaurantId: string) {
    return this.http.get<any>(`${API_URL}/categories`, { params: { restaurant: restaurantId } }).pipe(map((r) => (r.categories ?? []) as Cat[]));
  }
  addCategory(restaurant: string, nom: string) { return this.http.post(`${API_URL}/categories`, { restaurant, nom }); }
  renameCategory(id: string, nom: string) { return this.http.put(`${API_URL}/categories/${id}`, { nom }); }
  deleteCategory(id: string) { return this.http.delete(`${API_URL}/categories/${id}`); }

  // --- Plats ---
  dishes(restaurantId: string) {
    return this.http.get<any>(`${API_URL}/dishes`, { params: { restaurant: restaurantId } }).pipe(map((r) => (r.items ?? []) as MenuDish[]));
  }
  addDish(body: { restaurant: string; categorie: string; nom: string; prix: number; description: string; icon: string; image?: string }) {
    return this.http.post(`${API_URL}/dishes`, body);
  }
  updateDish(id: string, body: Partial<MenuDish>) { return this.http.put(`${API_URL}/dishes/${id}`, body); }
  deleteDish(id: string) { return this.http.delete(`${API_URL}/dishes/${id}`); }
}