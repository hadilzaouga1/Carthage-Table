// Carte d'un restaurant (design Lovable). Utilisée sur l'accueil et la page Restaurants.
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../core/icon';
import { Restaurant } from '../core/restaurant.service';
import { FavoriteService } from '../core/favorite.service';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-restaurant-card',
  standalone: true,
  imports: [RouterLink, Icon],
  template: `
    <article class="restaurant-card">
      <div class="restaurant-image">
        <a [routerLink]="['/restaurants', r()._id]" tabindex="-1">
          <!-- (error) : si la photo est introuvable, on passe à la photo par défaut -->
          <img [src]="src()" [alt]="'Cuisine de ' + r().nom" loading="lazy" (error)="onError()" />
        </a>
        <span class="restaurant-badge" [class.closed]="!r().isOpen"><span class="dot"></span>{{ r().isOpen ? 'Ouvert' : 'Fermé' }}</span>
        <button
          type="button"
          class="favorite icon-button"
          [class.is-favorite]="fav.isFavorite(r()._id)"
          (click)="toggleFavorite($event)"
          aria-label="Favori"
        >
          <app-icon name="heart"></app-icon>
        </button>
      </div>
      <div class="restaurant-content">
        <div class="restaurant-title">
          <h3><a [routerLink]="['/restaurants', r()._id]">{{ r().nom }}</a></h3>
          <span class="rating">
            <app-icon name="star"></app-icon>{{ displayRating() }}
            @if ((r().nombreAvis ?? 0) > 0) {
              <small> ({{ r().nombreAvis }})</small>
            }
          </span>
        </div>
        <p class="restaurant-subtitle">{{ r().typeCuisine }} · {{ r().adresse }}</p>
        <div class="restaurant-meta">
          <span><app-icon name="clock3"></app-icon>{{ r().horaires }}</span>
          <span><app-icon name="bike"></app-icon>Livraison {{ r().fraisLivraison.toFixed(2) }} DT</span>
        </div>
      </div>
    </article>
  `
})
export class RestaurantCard {
  fav = inject(FavoriteService);
  private auth = inject(AuthService);
  private router = inject(Router);

  r = input.required<Restaurant>();  // le restaurant à afficher (donné par le parent)
  failed = signal(false);            // true si la photo du restaurant est introuvable

  displayRating = computed(() => {
    const count = this.r().nombreAvis ?? 0;
    const avg = this.r().noteMoyenne ?? 0;
    return count > 0 ? avg.toFixed(1) : 'Nouveau';
  });

  // Adresse de la photo : photo par défaut si absente ou introuvable,
  // lien complet (https://...) utilisé tel quel, sinon fichier du dossier public/img
  src = computed(() => {
    const image = this.r().image;
    if (this.failed() || !image) return 'img/pizzeria.jpg';
    return /^(https?:)?\/\//.test(image) ? image : `img/${image}`;
  });

  toggleFavorite(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    this.fav.toggle(this.r()._id);
  }

  onError() { this.failed.set(true); }
}