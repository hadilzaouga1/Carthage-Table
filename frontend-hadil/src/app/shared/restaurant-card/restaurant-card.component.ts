import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Restaurant } from '../../core/models/restaurant.model';
import { CUISINE_TINTS, formatPrice } from '../../core/models/cuisines';

@Component({
  selector: 'app-restaurant-card',
  imports: [RouterLink],
  template: `
    <a class="rcard" [routerLink]="['/restaurants', restaurant()._id]">
      <div class="rtop" [style.background]="tint()"><span aria-hidden="true">{{ restaurant().icon }}</span></div>
      <div class="rbody">
        <div class="rhead">
          <h3>{{ restaurant().nom }}</h3>
          <span class="badge" [class.closed]="!restaurant().isOpen">{{ restaurant().isOpen ? 'Ouvert' : 'Fermé' }}</span>
        </div>
        <p class="meta">{{ restaurant().typeCuisine }} · {{ restaurant().horaires }}</p>
        <p class="fee">Livraison {{ fee() }}</p>
      </div>
    </a>
  `,
  styles: [`
    .rcard { display: block; color: inherit; background: var(--paper); border-radius: var(--r-md); box-shadow: var(--shadow); overflow: hidden; transition: transform .3s var(--ease), box-shadow .3s; }
    .rcard:hover { transform: translateY(-5px); box-shadow: var(--shadow-lift); }
    .rtop { height: 120px; display: grid; place-items: center; font-size: 3.4rem; }
    .rbody { padding: 1rem 1.1rem 1.2rem; }
    .rhead { display: flex; justify-content: space-between; align-items: center; gap: .5rem; }
    .rhead h3 { font-size: 1.15rem; margin: 0; }
    .badge { font-size: .75rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; background: #dff1e7; color: var(--ok); white-space: nowrap; }
    .badge.closed { background: #f3e1dc; color: var(--danger); }
    .meta { color: var(--muted); font-size: .9rem; margin: .4rem 0 .2rem; }
    .fee { margin: 0; font-weight: 700; color: var(--brown); font-size: .9rem; }
  `],
})
export class RestaurantCardComponent {
  restaurant = input.required<Restaurant>();
  tint = computed(() => CUISINE_TINTS[this.restaurant().typeCuisine] ?? '#f1e8cf');
  fee = computed(() => formatPrice(this.restaurant().fraisLivraison));
}
