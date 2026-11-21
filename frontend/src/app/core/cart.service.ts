// Le panier : un seul restaurant à la fois, gardé dans le navigateur (reste après F5).
// ATTENTION : les totaux ici ne servent qu'à l'AFFICHAGE. Le vrai total est recalculé par le serveur.
import { Injectable, computed, signal } from '@angular/core';

export interface CartLine { plat: string; nom: string; prix: number; icon: string; quantite: number; }

const CART_KEY = 'ct_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  restaurantId = signal<string | null>(null); // restaurant du panier
  restaurantNom = signal('');
  fraisLivraison = signal(0);
  lines = signal<CartLine[]>([]);              // lignes du panier

  // Valeurs calculées automatiquement
  count = computed(() => this.lines().reduce((s, l) => s + l.quantite, 0));
  sousTotal = computed(() => this.lines().reduce((s, l) => s + l.prix * l.quantite, 0));
  total = computed(() => (this.lines().length ? this.sousTotal() + this.fraisLivraison() : 0));

  constructor() {
    // On relit le panier sauvegardé au démarrage
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
      if (saved) {
        this.restaurantId.set(saved.restaurantId);
        this.restaurantNom.set(saved.restaurantNom);
        this.fraisLivraison.set(saved.fraisLivraison);
        this.lines.set(saved.lines);
      }
    } catch { /* panier corrompu : on repart de zéro */ }
  }

  // Ajouter un plat (ou +1 s'il est déjà dans le panier)
  add(r: { _id: string; nom: string; fraisLivraison: number }, d: { _id: string; nom: string; prix: number; icon: string }) {
    this.restaurantId.set(r._id);
    this.restaurantNom.set(r.nom);
    this.fraisLivraison.set(r.fraisLivraison);
    const existing = this.lines().find((l) => l.plat === d._id);
    if (existing) {
      this.lines.update((ls) => ls.map((l) => (l.plat === d._id ? { ...l, quantite: l.quantite + 1 } : l)));
    } else {
      this.lines.update((ls) => [...ls, { plat: d._id, nom: d.nom, prix: d.prix, icon: d.icon, quantite: 1 }]);
    }
    this.persist();
  }

  // Changer la quantité (+1 ou -1). À 0, la ligne disparaît.
  change(platId: string, delta: number) {
    this.lines.update((ls) =>
      ls.map((l) => (l.plat === platId ? { ...l, quantite: l.quantite + delta } : l)).filter((l) => l.quantite > 0)
    );
    if (!this.lines().length) this.clear(); else this.persist();
  }

  // Supprimer une ligne
  remove(platId: string) {
    this.lines.update((ls) => ls.filter((l) => l.plat !== platId));
    if (!this.lines().length) this.clear(); else this.persist();
  }

  // Vider le panier
  clear() {
    this.restaurantId.set(null);
    this.restaurantNom.set('');
    this.fraisLivraison.set(0);
    this.lines.set([]);
    localStorage.removeItem(CART_KEY);
  }

  // Sauvegarde dans le navigateur
  private persist() {
    localStorage.setItem(CART_KEY, JSON.stringify({
      restaurantId: this.restaurantId(), restaurantNom: this.restaurantNom(),
      fraisLivraison: this.fraisLivraison(), lines: this.lines()
    }));
  }
}