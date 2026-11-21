// Tableau de bord restaurateur : statistiques + commandes reçues + boutons pour faire avancer le statut.
import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { OrderService, Order, OrderStatus, Stats } from '../core/order.service';

const LABELS: Record<string, string> = {
  en_attente: 'En attente', acceptee: 'Acceptée', en_preparation: 'En préparation',
  en_livraison: 'En livraison', livree: 'Livrée', annulee: 'Annulée'
};

// Pour chaque statut : le bouton principal (statut suivant) et son texte.
// Cela respecte le cycle de vie du backend : on ne saute jamais d'étape.
const NEXT: Partial<Record<OrderStatus, { statut: OrderStatus; label: string }>> = {
  en_attente: { statut: 'acceptee', label: 'Accepter' },
  acceptee: { statut: 'en_preparation', label: 'Passer en préparation' },
  en_preparation: { statut: 'en_livraison', label: 'Passer en livraison' },
  en_livraison: { statut: 'livree', label: 'Marquer comme livrée' }
};

// Un restaurateur peut annuler tant que la commande n'est pas en livraison
const CAN_CANCEL: OrderStatus[] = ['en_attente', 'acceptee', 'en_preparation'];

@Component({
  selector: 'app-restaurateur',
  standalone: true,
  imports: [DatePipe],
  template: `
    <section class="section"><div class="container">
      <h2>Mon restaurant<span class="text-primary">.</span></h2>

      <!-- Statistiques -->
      @if (stats()) {
        <div class="stats">
          <div class="stat"><small>Commandes</small><strong>{{ stats()!.totalOrders }}</strong></div>
          <div class="stat"><small>En attente</small><strong>{{ stats()!.enAttente }}</strong></div>
          <div class="stat"><small>Acceptées</small><strong>{{ stats()!.acceptees }}</strong></div>
          <div class="stat"><small>Chiffre d'affaires</small><strong>{{ stats()!.chiffreAffaires.toFixed(2) }} DT</strong></div>
        </div>
        @if (stats()!.platsPopulaires.length) {
          <p class="top"><strong>Plats les plus commandés :</strong>
            @for (p of stats()!.platsPopulaires; track p.nom; let last = $last) { {{ p.nom }} ({{ p.quantite }}){{ last ? '' : ' · ' }} }
          </p>
        }
      }

      <!-- Filtre par statut -->
      <div class="filters">
        @for (f of filters; track f.value) {
          <button type="button" class="btn-ghost" [class.selected]="filter() === f.value" (click)="filter.set(f.value)">{{ f.label }}</button>
        }
      </div>

      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (!visible().length) { <p>Aucune commande pour ce filtre.</p> }

      @for (o of visible(); track o._id) {
        <article class="order">
          <div class="order-head">
            <strong>{{ o.client?.prenom }} {{ o.client?.nom }} <small>{{ o.client?.telephone }}</small></strong>
            <span class="badge" [attr.data-s]="o.statut">{{ label(o.statut) }}</span>
          </div>
          <small>{{ o.restaurant.nom }} · {{ o.createdAt | date: 'dd/MM/yyyy HH:mm' }}</small>
          <ul>
            @for (a of o.articles; track a.plat) { <li>{{ a.quantite }} × {{ a.nom }}</li> }
          </ul>
          <p><strong>Total : {{ o.total.toFixed(2) }} DT</strong> (paiement à la livraison)</p>
          <small>Adresse : {{ o.adresseLivraison }}</small>
          @if (o.remarque) { <small>Remarque : {{ o.remarque }}</small> }

          <div class="actions">
            @if (next(o.statut); as n) {
              <button type="button" class="btn-tomato" [disabled]="busy()" (click)="change(o, n.statut)">{{ n.label }}</button>
            }
            @if (canCancel(o.statut)) {
              <button type="button" class="btn-ghost" [disabled]="busy()" (click)="change(o, 'annulee')">{{ o.statut === 'en_attente' ? 'Refuser' : 'Annuler' }}</button>
            }
          </div>
        </article>
      }
    </div></section>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat { padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 4px; }
    .stat strong { font-size: 1.4rem; }
    .top { margin: 0 0 16px; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .order { padding: 16px 18px; margin: 14px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 6px; }
    .order-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .badge { padding: 4px 12px; border-radius: 999px; font-size: .85rem; font-weight: 700; border: 1px solid rgba(128,128,128,.4); }
    .badge[data-s="en_attente"] { background: #f5a623; color: #000; }
    .badge[data-s="livree"] { background: #2e9e5b; color: #fff; }
    .badge[data-s="annulee"] { background: #e5484d; color: #fff; }
    .actions { display: flex; gap: 10px; margin-top: 8px; }
    ul { margin: 0; padding-left: 18px; }
    .error { color: #e5484d; font-weight: 600; }
  `]
})
export class Restaurateur implements OnInit, OnDestroy {
  private service = inject(OrderService);

  orders = signal<Order[]>([]);
  stats = signal<Stats | null>(null);
  filter = signal<string>('toutes');
  busy = signal(false);
  error = signal('');
  private timer: any;

  filters = [
    { value: 'toutes', label: 'Toutes' }, { value: 'en_attente', label: 'En attente' },
    { value: 'acceptee', label: 'Acceptées' }, { value: 'en_preparation', label: 'En préparation' },
    { value: 'en_livraison', label: 'En livraison' }, { value: 'livree', label: 'Livrées' }
  ];

  ngOnInit() {
    this.load();
    // Rafraîchissement automatique toutes les 8 secondes : les nouvelles commandes apparaissent seules
    this.timer = setInterval(() => this.load(), 8000);
  }
  ngOnDestroy() { clearInterval(this.timer); }

  // Commandes affichées selon le filtre choisi
  visible() {
    return this.filter() === 'toutes' ? this.orders() : this.orders().filter((o) => o.statut === this.filter());
  }

  label(s: string) { return LABELS[s] || s; }
  next(s: OrderStatus) { return NEXT[s]; }
  canCancel(s: OrderStatus) { return CAN_CANCEL.includes(s); }

  // Recharge les commandes ET les statistiques
  private load() {
    this.service.restaurantOrders().subscribe({ next: (o) => this.orders.set(o), error: () => this.error.set('Impossible de charger les commandes.') });
    this.service.stats().subscribe({ next: (s) => this.stats.set(s) });
  }

  // Change le statut ; le serveur refuse tout passage interdit
  change(o: Order, statut: OrderStatus) {
    this.busy.set(true);
    this.error.set('');
    this.service.updateStatus(o._id, statut).subscribe({
      next: () => { this.busy.set(false); this.load(); },
      error: (err) => { this.busy.set(false); this.error.set(err.error?.message || 'Changement impossible.'); this.load(); }
    });
  }
}