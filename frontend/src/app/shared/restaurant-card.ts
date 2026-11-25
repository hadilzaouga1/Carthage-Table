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
  fav = inject(FavoriteService);
  private auth = inject(AuthService);
  private router = inject(Router);

  r = input.required<Restaurant>();  // le restaurant à afficher (donné par le parent)
  failed = signal(false);            // true si la photo du restaurant est introuvable

  // Photos de secours thématiques selon le type de cuisine pour éviter d'avoir la même image partout
  private fallbackByCuisine(type: string): string {
    const t = (type || '').toLowerCase();
    if (t.includes('burger') || t.includes('fast-food') || t.includes('américain')) return 'img/burger.jpg';
    if (t.includes('tunisien') || t.includes('oriental') || t.includes('traditionnel')) return 'img/chez-mami.jpg';
    if (t.includes('dessert') || t.includes('pâtisserie') || t.includes('sucré')) return 'img/dessert.jpg';
    if (t.includes('salade') || t.includes('healthy') || t.includes('végétarien')) return 'img/salade.jpg';
    if (t.includes('italien') || t.includes('pâtes') || t.includes('pasta')) return 'https://images.unsplash.com/photo-1621996346565-e3d5d6281292?w=800';
    if (t.includes('boisson') || t.includes('jus') || t.includes('café')) return 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=800';
    return 'img/pizza-house.jpg';
  }

  // Adresse de la photo : photo par défaut adaptée si absente ou introuvable,
  // lien complet (https://...) utilisé tel quel, sinon fichier du dossier public/img
  src = computed(() => {
    const image = this.r().image;
    if (this.failed() || !image) return this.fallbackByCuisine(this.r().typeCuisine);
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