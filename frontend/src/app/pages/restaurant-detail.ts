// Page d'un restaurant : infos + menu par catégorie + bouton Ajouter.
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant, Category, Dish } from '../core/restaurant.service';
import { CartService } from '../core/cart.service';

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="section"><div class="container">
      @if (loading()) {
        <p>Chargement du menu...</p>
      } @else if (!restaurant()) {
        <p>Restaurant introuvable.</p>
        <a routerLink="/restaurants" class="btn-ghost">← Retour aux restaurants</a>
      } @else {
        <a routerLink="/restaurants" class="text-link">← Tous les restaurants</a>

        <div class="menu-head">
          <h2>{{ restaurant()!.icon || '🍽️' }} {{ restaurant()!.nom }}</h2>
          <p>{{ restaurant()!.typeCuisine }} · {{ restaurant()!.adresse }}</p>
          <p>{{ restaurant()!.description }}</p>
          <p><strong>{{ restaurant()!.isOpen ? 'Ouvert' : 'Fermé' }}</strong> · {{ restaurant()!.horaires }} · Livraison {{ restaurant()!.fraisLivraison.toFixed(2) }} DT</p>
        </div>

        @if (!restaurant()!.isOpen) { <p class="notice">Ce restaurant est fermé : vous ne pouvez pas commander pour le moment.</p> }

        @for (c of categories(); track c._id) {
          <h3 class="cat-title">{{ c.nom }}</h3>
          <div class="dish-list">
            @for (d of dishesOf(c._id); track d._id) {
              <div class="dish">
                <div class="dish-icon">{{ d.icon }}</div>
                <div class="dish-info"><strong>{{ d.nom }}</strong><p>{{ d.description }}</p></div>
                <div class="dish-side">
                  <span class="price">{{ d.prix.toFixed(2) }} DT</span>
                  @if (d.disponible && restaurant()!.isOpen) {
                    <button type="button" class="btn-tomato" (click)="add(d)">Ajouter</button>
                  } @else {
                    <span class="unavailable">Indisponible</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Barre du panier, visible dès qu'il y a un plat -->
        @if (cart.count() > 0) {
          <a routerLink="/panier" class="btn-tomato cart-bar">Voir mon panier ({{ cart.count() }}) · {{ cart.sousTotal().toFixed(2) }} DT</a>
        }
      }
    </div></section>
  `,
  styles: [`
    .menu-head { margin: 16px 0 24px; }
    .notice { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(220,60,60,.5); margin-bottom: 16px; }
    .cat-title { margin: 28px 0 12px; }
    .dish-list { display: grid; gap: 12px; }
    .dish { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; }
    .dish-icon { font-size: 2rem; }
    .dish-info { flex: 1; }
    .dish-info p { margin: 4px 0 0; opacity: .7; font-size: .9rem; }
    .dish-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .price { font-weight: 700; }
    .unavailable { opacity: .6; font-size: .9rem; }
    .cart-bar { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 50; box-shadow: 0 6px 24px rgba(0,0,0,.3); }
  `]
})
export class RestaurantDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(RestaurantService);
  cart = inject(CartService);

  loading = signal(true);
  restaurant = signal<Restaurant | null>(null);
  categories = signal<Category[]>([]);
  dishes = signal<Dish[]>([]);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.service.getOne(id).subscribe({
      next: (res) => {
        this.restaurant.set(res.restaurant);
        this.categories.set(res.categories);
        this.dishes.set(res.dishes);
        this.loading.set(false);
      },
      error: () => { this.restaurant.set(null); this.loading.set(false); }
    });
  }

  // Les plats d'une catégorie
  dishesOf(categoryId: string) { return this.dishes().filter((d) => d.categorie === categoryId); }

  // Ajouter au panier (un panier = un seul restaurant)
  add(d: Dish) {
    const r = this.restaurant();
    if (!r) return;
    if (this.cart.count() > 0 && this.cart.restaurantId() !== r._id) {
      if (!confirm('Votre panier contient des plats d\'un autre restaurant. Le vider pour commencer un nouveau panier ?')) return;
      this.cart.clear();
    }
    this.cart.add(r, d);
  }
}