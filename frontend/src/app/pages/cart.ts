// Page Panier + validation de la commande (paiement à la livraison).
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../core/cart.service';
import { OrderService } from '../core/order.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section"><div class="container">
      <h2>Mon panier<span class="text-primary">.</span></h2>

      @if (!cart.lines().length) {
        <p>Votre panier est vide.</p>
        <a routerLink="/restaurants" class="btn-tomato">Voir les restaurants</a>
      } @else {
        <p>Restaurant : <strong>{{ cart.restaurantNom() }}</strong></p>

        <div class="lines">
          @for (l of cart.lines(); track l.plat) {
            <div class="line">
              <span class="icon">{{ l.icon }}</span>
              <span class="name">{{ l.nom }}</span>
              <span class="qty">
                <button type="button" class="btn-ghost" (click)="cart.change(l.plat, -1)">−</button>
                <strong>{{ l.quantite }}</strong>
                <button type="button" class="btn-ghost" (click)="cart.change(l.plat, 1)">+</button>
              </span>
              <span class="amount">{{ (l.prix * l.quantite).toFixed(2) }} DT</span>
              <button type="button" class="btn-ghost" (click)="cart.remove(l.plat)" aria-label="Supprimer">✕</button>
            </div>
          }
        </div>

        <div class="summary">
          <p>Sous-total : {{ cart.sousTotal().toFixed(2) }} DT</p>
          <p>Livraison : {{ cart.fraisLivraison().toFixed(2) }} DT</p>
          <p class="total">Total : {{ cart.total().toFixed(2) }} DT</p>
          <small>Le total final est confirmé par le serveur. Paiement à la livraison.</small>
        </div>

        <div class="form">
          <label>Adresse de livraison *</label>
          <input type="text" placeholder="Ex : 12 rue de Carthage, Tunis" [value]="adresse()" (input)="adresse.set($any($event.target).value)" />
          <label>Remarque (facultatif)</label>
          <input type="text" placeholder="Ex : sans oignons" [value]="remarque()" (input)="remarque.set($any($event.target).value)" />
        </div>

        @if (error()) { <p class="error">{{ error() }}</p> }

        <button type="button" class="btn-tomato" [disabled]="sending()" (click)="order()">
          {{ auth.user() ? (sending() ? 'Envoi...' : 'Commander') : 'Se connecter pour commander' }}
        </button>
      }
    </div></section>
  `,
  styles: [`
    .lines { display: grid; gap: 10px; margin: 16px 0; }
    .line { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .name { flex: 1; font-weight: 600; }
    .qty { display: flex; align-items: center; gap: 10px; }
    .amount { min-width: 90px; text-align: right; font-weight: 700; }
    .summary { margin: 20px 0; }
    .summary p { margin: 4px 0; }
    .total { font-size: 1.3rem; font-weight: 800; }
    .form { display: grid; gap: 8px; max-width: 520px; margin-bottom: 16px; }
    .form input { padding: 12px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .error { color: #e5484d; font-weight: 600; }
  `]
})
export class Cart {
  cart = inject(CartService);
  auth = inject(AuthService);
  private orders = inject(OrderService);
  private router = inject(Router);

  adresse = signal('');
  remarque = signal('');
  sending = signal(false);
  error = signal('');

  order() {
    // Il faut être connecté pour commander
    if (!this.auth.user()) { this.router.navigate(['/login']); return; }
    if (!this.adresse().trim()) { this.error.set("L'adresse de livraison est obligatoire."); return; }

    this.error.set('');
    this.sending.set(true);
    this.orders.create({
      restaurant: this.cart.restaurantId()!,
      // On envoie seulement le plat et la quantité : le serveur relit les prix dans la base
      articles: this.cart.lines().map((l) => ({ plat: l.plat, quantite: l.quantite })),
      adresseLivraison: this.adresse().trim(),
      remarque: this.remarque().trim()
    }).subscribe({
      next: () => { this.cart.clear(); this.router.navigate(['/commandes']); },
      error: (err) => { this.sending.set(false); this.error.set(err.error?.message || 'Impossible de passer la commande.'); }
    });
  }
}