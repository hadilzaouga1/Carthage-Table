// Service des commandes : côté client (commander, suivre, annuler) et côté restaurateur (traiter, statistiques).
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { API_URL } from './config';

export type OrderStatus = 'en_attente' | 'acceptee' | 'en_preparation' | 'en_livraison' | 'livree' | 'annulee';

export interface OrderLine { plat: string; nom: string; quantite: number; prixUnitaire: number; }

// Une commande telle que renvoyée par le backend (voir models/Order.js)
export interface Order {
  _id: string;
  restaurant: { _id?: string; nom: string; image?: string };
  client?: { nom: string; prenom: string; telephone?: string }; // rempli pour le restaurateur
  articles: OrderLine[];
  adresseLivraison: string;
  sousTotal: number;
  fraisLivraison: number;
  total: number;
  statut: OrderStatus;
  remarque?: string;
  createdAt: string;
}

// Statistiques du tableau de bord restaurateur (GET /api/orders/stats)
export interface Stats {
  totalOrders: number;
  enAttente: number;
  acceptees: number;
  chiffreAffaires: number;
  platsPopulaires: { nom: string; quantite: number }[];
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);

  // POST /api/orders : on envoie seulement les ids et les quantités, JAMAIS les prix
  create(body: { restaurant: string; articles: { plat: string; quantite: number }[]; adresseLivraison: string; remarque?: string }) {
    return this.http.post<{ success: boolean; order: Order }>(`${API_URL}/orders`, { ...body, modePaiement: 'livraison' });
  }

  // GET /api/orders/my-orders (client)
  myOrders() {
    return this.http.get<{ success: boolean; orders: Order[] }>(`${API_URL}/orders/my-orders`).pipe(map((r) => r.orders));
  }

  // GET /api/orders/restaurant (restaurateur : commandes de SES restaurants)
  restaurantOrders() {
    return this.http.get<{ success: boolean; orders: Order[] }>(`${API_URL}/orders/restaurant`).pipe(map((r) => r.orders));
  }

  // GET /api/orders/stats (restaurateur)
  stats() {
    return this.http.get<{ success: boolean; stats: Stats }>(`${API_URL}/orders/stats`).pipe(map((r) => r.stats));
  }

  // PUT /api/orders/:id/status : le serveur vérifie les droits et le cycle de vie
  updateStatus(id: string, statut: OrderStatus) {
    return this.http.put(`${API_URL}/orders/${id}/status`, { statut });
  }

  // Raccourci pour le client : annuler sa commande
  cancel(id: string) {
    return this.updateStatus(id, 'annulee');
  }
}