// Service de l'administrateur : statistiques, restaurants (création, validation), utilisateurs.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_URL } from './config';

export interface AdminStats { clients: number; restaurants: number; restaurantsEnAttente: number; commandes: number; chiffreAffaires: number; }
export interface AdminRestaurant { _id: string; nom: string; typeCuisine: string; adresse: string; status: string; isOpen: boolean; }
export interface AdminUser { _id?: string; id?: string; nom: string; prenom: string; email: string; role: string; isActive?: boolean; }

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  stats() { return this.http.get<any>(`${API_URL}/admin/stats`).pipe(map((r) => r.stats as AdminStats)); }

  // Tous les restaurants, quel que soit leur statut (filtre facultatif)
  restaurants(status?: string) {
    const params: Record<string, string> = { limit: '50' };
    if (status) params['status'] = status;
    return this.http.get<any>(`${API_URL}/restaurants/all`, { params }).pipe(map((r) => (r.restaurants ?? r.items ?? []) as AdminRestaurant[]));
  }

  // Créer un restaurant pour un restaurateur : créé par l'admin = déjà validé
  createRestaurant(body: { nom: string; adresse: string; typeCuisine: string; fraisLivraison: number; owner: string }) {
    return this.http.post(`${API_URL}/restaurants`, body);
  }

  // Valider ou suspendre : en_attente | valide | suspendu
  setRestaurantStatus(id: string, status: string) { return this.http.put(`${API_URL}/restaurants/${id}`, { status }); }

  users() { return this.http.get<any>(`${API_URL}/users`, { params: { limit: '100' } }).pipe(map((r) => (r.users ?? r.items ?? []) as AdminUser[])); }
  setActive(id: string, isActive: boolean) { return this.http.put(`${API_URL}/users/${id}/status`, { isActive }); }
  setRole(id: string, role: string) { return this.http.put(`${API_URL}/users/${id}/role`, { role }); }
}