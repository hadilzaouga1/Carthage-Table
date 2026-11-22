// Page « Mes favoris » : les restaurants que le client a marqués d'un cœur.
import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FavoriteService } from '../core/favorite.service';
import { Restaurant } from '../core/restaurant.service';
import { RestaurantCard } from '../shared/restaurant-card';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [RestaurantCard, RouterLink],
  template: `
    <section class="section"><div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">MES FAVORIS</p>
          <h2>Vos tables préférées<span class="text-primary">.</span></h2>
        </div>
      </div>

      @if (error()) { <div class="form-error" role="alert">{{ error() }}</div> }

      @if (loading()) {
        <p class="results-count">Chargement…</p>
      } @else if (visible().length) {
        <p class="results-count">{{ visible().length }} restaurant(s) en favori</p>
        <div class="restaurant-grid">
          @for (r of visible(); track r._id) { <app-restaurant-card [r]="r" /> }
        </div>
      } @else if (!error()) {
        <p class="results-count">Vous n'avez pas encore de favori. Touchez le cœur d'un restaurant pour le retrouver ici.</p>
        <a routerLink="/restaurants" class="btn-tomato">Découvrir les restaurants</a>
      }
    </div></section>
  `
})
export class Favorites implements OnInit {
  private fav = inject(FavoriteService);

  private all = signal<Restaurant[]>([]);
  loading = signal(true);
  error = signal('');

  // On masque tout de suite un restaurant dont on retire le cœur
  visible = computed(() => this.all().filter((r) => this.fav.isFavorite(r._id)));

  ngOnInit() {
    this.fav.restaurants().subscribe({
      next: (list) => { this.all.set(list); this.loading.set(false); },
      error: () => { this.error.set('Impossible de charger vos favoris. Le backend est-il lancé ?'); this.loading.set(false); }
    });
  }
}