// Service de l'administrateur : statistiques, restaurants (création, validation), utilisateurs.
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_URL } from './config';

export interface AdminStats {
  clients: number; restaurateurs?: number; restaurants: number; restaurantsEnAttente: number; commandes: number; chiffreAffaires: number;
  commandesParStatut?: Record<string, number>;
  restaurantsPopulaires?: { nom: string; commandes: number; chiffreAffaires: number }[];
}
export interface AdminRestaurant { _id: string; nom: string; typeCuisine: string; adresse: string; status: string; isOpen: boolean; fraisLivraison?: number; horaires?: string; description?: string; }
export interface UsersPage { users: AdminUser[]; total: number; page: number; pages: number; }
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

  // Modifier les informations d'un restaurant (nom, adresse, cuisine, frais, horaires...)
  updateRestaurant(id: string, body: Partial<AdminRestaurant>) { return this.http.put(`${API_URL}/restaurants/${id}`, body); }

  // Supprimer un restaurant (avec ses catégories et ses plats)
  deleteRestaurant(id: string) { return this.http.delete(`${API_URL}/restaurants/${id}`); }

  // Liste des utilisateurs : recherche (nom, prénom, email), filtre de rôle, pagination
  users(options: { search?: string; role?: string; page?: number; limit?: number } = {}) {
    const params: Record<string, string> = { limit: String(options.limit ?? 10), page: String(options.page ?? 1) };
    if (options.search) params['search'] = options.search;
    if (options.role) params['role'] = options.role;
    return this.http.get<any>(`${API_URL}/users`, { params }).pipe(
      map((r): UsersPage => ({ users: r.users ?? r.items ?? [], total: r.total ?? 0, page: r.page ?? 1, pages: r.pages ?? 1 }))
    );
  }

  // Les restaurateurs (pour choisir le propriétaire d'un nouveau restaurant)
  restaurateurs() { return this.users({ role: 'restaurateur', limit: 100 }).pipe(map((p) => p.users)); }
  setActive(id: string, isActive: boolean) { return this.http.put(`${API_URL}/users/${id}/status`, { isActive }); }
  setRole(id: string, role: string) { return this.http.put(`${API_URL}/users/${id}/role`, { role }); }
}