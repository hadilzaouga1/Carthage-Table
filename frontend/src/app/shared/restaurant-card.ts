// Carte d'un restaurant (design Lovable). Utilisée sur l'accueil et la page Restaurants.
import { Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../core/icon';
import { Restaurant } from '../core/restaurant.service';

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
        <button type="button" class="favorite icon-button" [class.is-favorite]="favorite()" (click)="favorite.set(!favorite())" aria-label="Favori">
          <app-icon name="heart"></app-icon>
        </button>
      </div>
      <div class="restaurant-content">
        <div class="restaurant-title">
          <h3><a [routerLink]="['/restaurants', r()._id]">{{ r().nom }}</a></h3>
          <span class="rating"><app-icon name="star"></app-icon>4.8</span>
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
  r = input.required<Restaurant>();  // le restaurant à afficher (donné par le parent)
  favorite = signal(false);          // état du coeur
  failed = signal(false);            // true si la photo du restaurant est introuvable

  // Adresse de la photo : photo par défaut si absente ou introuvable,
  // lien complet (https://...) utilisé tel quel, sinon fichier du dossier public/img
  src = computed(() => {
    const image = this.r().image;
    if (this.failed() || !image) return 'img/pizzeria.jpg';
    return /^(https?:)?\/\//.test(image) ? image : `img/${image}`;
  });

  onError() { this.failed.set(true); }
}