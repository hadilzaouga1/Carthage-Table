// Page « Mes commandes » : le client suit le statut de ses commandes (rafraîchi toutes les 8 secondes).
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService, Order, OrderStatus } from '../core/order.service';

// Les étapes du cycle de vie d'une commande (dans l'ordre)
const STEPS: OrderStatus[] = ['en_attente', 'acceptee', 'en_preparation', 'en_livraison', 'livree'];
const LABELS: Record<string, string> = {
  en_attente: 'En attente', acceptee: 'Acceptée', en_preparation: 'En préparation',
  en_livraison: 'En livraison', livree: 'Livrée', annulee: 'Annulée'
};

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="section"><div class="container">
      <h2>Mes commandes<span class="text-primary">.</span></h2>

      @if (!orders().length) {
        <p>Vous n'avez pas encore de commande.</p>
        <a routerLink="/restaurants" class="btn-tomato">Commander maintenant</a>
      }

      @for (o of orders(); track o._id) {
        <article class="order">
          <div class="order-head">
            <strong>{{ o.restaurant.nom }}</strong>
            <span>{{ o.createdAt | date: 'dd/MM/yyyy HH:mm' }}</span>
          </div>

          <!-- Barre de progression du statut -->
          @if (o.statut === 'annulee') {
            <p class="cancelled">Commande annulée</p>
          } @else {
            <div class="steps">
              @for (s of steps; track s; let i = $index) {
                <span class="step" [class.done]="stepIndex(o.statut) >= i">{{ label(s) }}</span>
              }
            </div>
          }

          <ul>
            @for (a of o.articles; track a.plat) { <li>{{ a.quantite }} × {{ a.nom }} — {{ (a.quantite * a.prixUnitaire).toFixed(2) }} DT</li> }
          </ul>
          <p>Livraison : {{ o.fraisLivraison.toFixed(2) }} DT · <strong>Total : {{ o.total.toFixed(2) }} DT</strong></p>
          <small>Adresse : {{ o.adresseLivraison }}</small>

          @if (o.statut === 'en_attente') {
            <div><button type="button" class="btn-ghost" (click)="cancel(o)">Annuler la commande</button></div>
          }
        </article>
      }
    </div></section>
  `,
  styles: [`
    .order { padding: 16px 18px; margin: 16px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 8px; }
    .order-head { display: flex; justify-content: space-between; }
    .steps { display: flex; flex-wrap: wrap; gap: 8px; }
    .step { padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(128,128,128,.4); opacity: .5; font-size: .85rem; }
    .step.done { opacity: 1; background: #e8590c; border-color: #e8590c; color: #fff; font-weight: 700; }
    .cancelled { color: #e5484d; font-weight: 700; }
    ul { margin: 0; padding-left: 18px; }
  `]
})
export class Orders implements OnInit, OnDestroy {
  private service = inject(OrderService);
  orders = signal<Order[]>([]);
  steps = STEPS;
  private timer: any;

  ngOnInit() {
    this.load();
    // Rafraîchissement automatique : le client voit le statut changer sans recharger la page
    this.timer = setInterval(() => this.load(), 8000);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  private load() { this.service.myOrders().subscribe({ next: (o) => this.orders.set(o) }); }

  label(s: string) { return LABELS[s] || s; }
  stepIndex(s: OrderStatus) { return STEPS.indexOf(s); }

  cancel(o: Order) {
    if (!confirm('Annuler cette commande ?')) return;
    this.service.cancel(o._id).subscribe({ next: () => this.load(), error: () => this.load() });
  }
}