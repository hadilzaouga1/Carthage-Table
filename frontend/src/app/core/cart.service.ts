// Le panier : un seul restaurant à la fois, gardé dans le navigateur (reste après F5).
// ATTENTION : les totaux ici ne servent qu'à l'AFFICHAGE. Le vrai total est recalculé par le serveur.
import { Injectable, computed, signal } from '@angular/core';

export interface CartLine {
  plat: string;
  nom: string;
  prix: number;
  image?: string;
  icon?: string;
  quantite: number;
}

export type PromoRule =
  | { code: 'RESTORA10'; label: '-10 % sur le sous-total'; type: 'percent'; value: 10 }
  | { code: 'BIENVENUE'; label: 'Livraison offerte'; type: 'free_delivery'; value: 0 };

const PROMOS: Record<string, PromoRule> = {
  RESTORA10: { code: 'RESTORA10', label: '-10 % sur le sous-total', type: 'percent', value: 10 },
  BIENVENUE: { code: 'BIENVENUE', label: 'Livraison offerte', type: 'free_delivery', value: 0 }
};

const CART_KEY = 'ct_cart';
const round3 = (n: number) => Math.round(n * 1000) / 1000;

@Injectable({ providedIn: 'root' })
export class CartService {
  restaurantId = signal<string | null>(null); // restaurant du panier
  restaurantNom = signal('');
  fraisLivraison = signal(0);
  lines = signal<CartLine[]>([]);              // lignes du panier
  promoCode = signal<string | null>(null);
  promoError = signal('');

  // Règle promo active (si valide)
  activePromo = computed<PromoRule | null>(() => {
    const code = this.promoCode();
    if (!code) return null;
    return PROMOS[code] || null;
  });

  // Valeurs calculées automatiquement
  count = computed(() => this.lines().reduce((s, l) => s + l.quantite, 0));
  sousTotal = computed(() => round3(this.lines().reduce((s, l) => s + l.prix * l.quantite, 0)));

  remise = computed(() => {
    if (!this.lines().length) return 0;
    const promo = this.activePromo();
    if (!promo || promo.type !== 'percent') return 0;
    return round3(Math.min(this.sousTotal(), (this.sousTotal() * promo.value) / 100));
  });

  fraisEffectifs = computed(() => {
    if (!this.lines().length) return 0;
    const promo = this.activePromo();
    if (promo?.type === 'free_delivery') return 0;
    return round3(this.fraisLivraison());
  });

  total = computed(() =>
    this.lines().length ? round3(Math.max(0, this.sousTotal() - this.remise()) + this.fraisEffectifs()) : 0
  );

  constructor() {
    // On relit le panier sauvegardé au démarrage
    try {
      const saved = JSON.parse(localStorage.getItem(CART_KEY) || 'null');
      if (saved) {
        this.restaurantId.set(saved.restaurantId ?? null);
        this.restaurantNom.set(saved.restaurantNom ?? '');
        this.fraisLivraison.set(saved.fraisLivraison ?? 0);
        this.lines.set(Array.isArray(saved.lines) ? saved.lines : []);
        this.promoCode.set(typeof saved.promoCode === 'string' ? saved.promoCode : null);
      }
    } catch {
      /* panier corrompu : on repart de zéro */
    }
  }

  // Ajouter un plat (ou +1 s'il est déjà dans le panier)
  add(
    r: { _id: string; nom: string; fraisLivraison: number },
    d: { _id: string; nom: string; prix: number; image?: string; icon?: string }
  ) {
    this.restaurantId.set(r._id);
    this.restaurantNom.set(r.nom);
    this.fraisLivraison.set(r.fraisLivraison);
    const existing = this.lines().find((l) => l.plat === d._id);
    if (existing) {
      this.lines.update((ls) => ls.map((l) => (l.plat === d._id ? { ...l, quantite: l.quantite + 1 } : l)));
    } else {
      this.lines.update((ls) => [...ls, { plat: d._id, nom: d.nom, prix: d.prix, image: d.image, quantite: 1 }]);
    }
    this.persist();
  }

  // Changer la quantité (+1 ou -1). À 0, la ligne disparaît.
  change(platId: string, delta: number) {
    this.lines.update((ls) =>
      ls.map((l) => (l.plat === platId ? { ...l, quantite: l.quantite + delta } : l)).filter((l) => l.quantite > 0)
    );
    if (!this.lines().length) this.clear();
    else this.persist();
  }

  // Supprimer une ligne
  remove(platId: string) {
    this.lines.update((ls) => ls.filter((l) => l.plat !== platId));
    if (!this.lines().length) this.clear();
    else this.persist();
  }

  // Appliquer un code promo
  applyPromo(rawCode: string): boolean {
    this.promoError.set('');
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      this.promoCode.set(null);
      this.persist();
      return true;
    }
    if (!PROMOS[normalized]) {
      this.promoError.set(`Code promo inconnu ("${normalized}"). Essayez RESTORA10 ou BIENVENUE.`);
      return false;
    }
    this.promoCode.set(normalized);
    this.persist();
    return true;
  }

  // Retirer le code promo
  clearPromo() {
    this.promoError.set('');
    this.promoCode.set(null);
    this.persist();
  }

  // Vider le panier
  clear() {
    this.restaurantId.set(null);
    this.restaurantNom.set('');
    this.fraisLivraison.set(0);
    this.lines.set([]);
    this.promoCode.set(null);
    this.promoError.set('');
    localStorage.removeItem(CART_KEY);
  }

  // Sauvegarde dans le navigateur
  private persist() {
    localStorage.setItem(
      CART_KEY,
      JSON.stringify({
        restaurantId: this.restaurantId(),
        restaurantNom: this.restaurantNom(),
        fraisLivraison: this.fraisLivraison(),
        lines: this.lines(),
        promoCode: this.promoCode()
      })
    );
  }
}