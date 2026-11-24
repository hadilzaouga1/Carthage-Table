// Page « Tous les restaurants » : recherche, filtre par cuisine, ouverts seulement, tri A→Z / Z→A, pagination.
import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestaurantService, Restaurant } from '../core/restaurant.service';
import { CuisineService } from '../core/cuisine.service';
import { RestaurantCard } from '../shared/restaurant-card';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-restaurants',
  standalone: true,
  imports: [RestaurantCard, Icon],
  template: `
    <section class="section"><div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">TOUS LES RESTAURANTS</p>
          <h2>Choisissez votre table<span class="text-primary">.</span></h2>
        </div>
      </div>

      <!-- Barre de recherche : on cherche pendant que l'utilisateur tape -->
      <div class="search-bar">
        <app-icon name="search"></app-icon>
        <input type="search" placeholder="Rechercher un restaurant..." [value]="search" (input)="onSearch($any($event.target).value)" />
      </div>

      <!-- Filtre par type de cuisine + bouton "ouverts seulement" -->
      <div class="cuisine-row">
        @for (c of cuisines(); track c) {
          <button type="button" class="btn-ghost cuisine-button" [class.selected]="cuisine() === c" (click)="chooseCuisine(c)">{{ c }}</button>
        }
        <button type="button" class="btn-ghost cuisine-button" [class.selected]="onlyOpen()" (click)="toggleOpen()">Ouverts seulement</button>
        <!-- Tri alphabétique (cahier des charges, module 2) -->
        <select class="field sort-select" aria-label="Trier les restaurants" (change)="setSort($any($event.target).value)">
          <option value="asc" [selected]="sortDir() === 'asc'">A → Z</option>
          <option value="desc" [selected]="sortDir() === 'desc'">Z → A</option>
        </select>
      </div>

      <p class="results-count">{{ total() }} restaurant(s) trouvé(s)</p>

      <div class="restaurant-grid">
        @for (r of restaurants(); track r._id) { <app-restaurant-card [r]="r" /> }
      </div>

      @if (!restaurants().length) { <p class="results-count">Aucun restaurant ne correspond à votre recherche.</p> }

      <!-- Pagination : précédent / suivant -->
      @if (pages() > 1) {
        <div class="pager">
          <button type="button" class="btn-ghost" [disabled]="page() <= 1" (click)="goTo(page() - 1)">← Précédent</button>
          <span>Page {{ page() }} / {{ pages() }}</span>
          <button type="button" class="btn-ghost" [disabled]="page() >= pages()" (click)="goTo(page() + 1)">Suivant →</button>
        </div>
      }
    </div></section>
  `,
  styles: [`
    .search-bar { display: flex; align-items: center; gap: 12px; padding: 12px 18px; margin: 8px 0 20px;
      border: 1px solid rgba(128,128,128,.35); border-radius: 999px; max-width: 520px; }
    .search-bar input { flex: 1; border: 0; outline: 0; background: transparent; font: inherit; color: inherit; }
    .pager { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 28px; }
  `]
})
export class Restaurants implements OnInit {
  private service = inject(RestaurantService);
  private cuisineApi = inject(CuisineService);
  private route = inject(ActivatedRoute);

  restaurants = signal<Restaurant[]>([]); // restaurants affichés
  total = signal(0);                      // nombre total trouvé
  page = signal(1);                       // page courante
  pages = signal(1);                      // nombre de pages
  cuisine = signal('Tous');               // cuisine choisie
  onlyOpen = signal(false);               // true = ouverts seulement
  search = '';                            // texte de recherche (rempli aussi depuis l'URL : /restaurants?search=pizza)
  sortDir = signal<'asc' | 'desc'>('asc');  // ordre alphabétique
  private timer: any;                     // petit délai pour ne pas appeler l'API à chaque lettre

  // Les cuisines viennent de l'API (gérées par l'administrateur)
  cuisines = signal<string[]>(['Tous']);

  ngOnInit() {
    this.cuisineApi.list().subscribe((list) => this.cuisines.set(['Tous', ...list.map((c) => c.nom)]));
    // On suit l'adresse de la page : /restaurants?search=pizza&typeCuisine=Italien (liens depuis l'accueil)
    this.route.queryParamMap.subscribe((p) => {
      this.search = p.get('search') ?? '';
      this.cuisine.set(p.get('typeCuisine') ?? 'Tous');
      this.page.set(1);
      this.load();
    });
  }

  onSearch(text: string) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.search = text.trim(); this.page.set(1); this.load(); }, 300);
  }
  chooseCuisine(c: string) { this.cuisine.set(c); this.page.set(1); this.load(); }
  toggleOpen() { this.onlyOpen.set(!this.onlyOpen()); this.page.set(1); this.load(); }
  setSort(dir: string) { this.sortDir.set(dir === 'desc' ? 'desc' : 'asc'); this.page.set(1); this.load(); }
  goTo(p: number) { this.page.set(p); this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

  // Appel à l'API avec tous les filtres
  private load() {
    this.service.list({
      search: this.search || undefined,
      typeCuisine: this.cuisine() === 'Tous' ? undefined : this.cuisine(),
      open: this.onlyOpen() || undefined,
      sort: this.sortDir(),
      page: this.page(),
      limit: 12
    }).subscribe({
      next: res => { this.restaurants.set(res.restaurants); this.total.set(res.total); this.pages.set(res.pages); },
      error: () => { this.restaurants.set([]); this.total.set(0); }
    });
  }
}