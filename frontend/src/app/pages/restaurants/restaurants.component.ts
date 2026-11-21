import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantService } from '../../core/services/restaurant.service';
import { RestaurantCardComponent } from '../../shared/restaurant-card/restaurant-card.component';
import { CuisineTabsComponent } from '../../shared/cuisine-tabs/cuisine-tabs.component';

const PAGE_SIZE = 9;

@Component({
  selector: 'app-restaurants',
  imports: [RestaurantCardComponent, CuisineTabsComponent],
  template: `
    <section class="container page">
      <header class="head">
        <p class="script">à votre table</p>
        <h1>Tous les restaurants</h1>
      </header>

      <div class="search" role="search">
        <input type="search" placeholder="Rechercher un restaurant par son nom" aria-label="Rechercher un restaurant"
               [value]="query()" (input)="setQuery($any($event.target).value)">
      </div>

      <app-cuisine-tabs [value]="cuisine()" (valueChange)="setCuisine($event)" />

      <div class="toolbar">
        <label class="chip">
          <input type="checkbox" [checked]="onlyOpen()" (change)="toggleOpen()"> Ouverts maintenant
        </label>
        <span class="count">{{ total() }} restaurant{{ total() > 1 ? 's' : '' }} · classés de A à Z</span>
      </div>

      @if (error()) {
        <div class="alert alert-error" role="alert">{{ error() }}</div>
      } @else if (loading() && !items().length) {
        <div class="grid" aria-busy="true">@for (i of [1,2,3]; track i) { <div class="sk"></div> }</div>
      } @else if (items().length) {
        <div class="grid" [class.dim]="loading()">
          @for (r of items(); track r._id) { <app-restaurant-card [restaurant]="r" /> }
        </div>

        @if (pages() > 1) {
          <nav class="pager" aria-label="Pagination">
            <button class="btn btn-ghost" type="button" [disabled]="page() <= 1" (click)="go(page() - 1)">Précédent</button>
            <span>Page {{ page() }} sur {{ pages() }}</span>
            <button class="btn btn-ghost" type="button" [disabled]="page() >= pages()" (click)="go(page() + 1)">Suivant</button>
          </nav>
        }
      } @else {
        <div class="empty card">
          <p>Aucun restaurant ne correspond à votre recherche.</p>
          <button class="btn btn-ghost" type="button" (click)="reset()">Effacer les filtres</button>
        </div>
      }
    </section>
  `,
  styles: [`
    .page { padding: 2.5rem 0 1rem; }
    .head h1 { font-size: clamp(2rem, 4vw, 2.8rem); color: var(--indigo-dark); }
    .head .script { margin: 0; }
    .search { margin: 1rem 0 .4rem; max-width: 520px; }
    .search input { width: 100%; padding: .95rem 1.4rem; font: inherit; color: var(--ink); border: 0; border-radius: 999px; background: var(--paper); box-shadow: var(--shadow); }
    .search input:focus { outline: none; box-shadow: 0 0 0 4px var(--indigo-soft), var(--shadow); }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin: .4rem 0 1.4rem; }
    .chip { display: inline-flex; align-items: center; gap: .45rem; padding: .45rem .9rem; border-radius: 999px; background: var(--paper); box-shadow: inset 0 0 0 2px var(--line); cursor: pointer; font-size: .9rem; }
    .chip:has(input:checked) { background: var(--indigo-soft); box-shadow: inset 0 0 0 2px var(--indigo); }
    .chip input { accent-color: var(--indigo); }
    .count { margin-left: auto; color: var(--muted); font-size: .9rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.4rem; transition: opacity .2s; }
    .grid.dim { opacity: .55; }
    .sk { height: 232px; border-radius: var(--r-md); background: linear-gradient(100deg, var(--cream-2) 30%, var(--paper) 50%, var(--cream-2) 70%) 0 0 / 300% 100%; animation: shimmer 1.4s linear infinite; }
    @keyframes shimmer { to { background-position: -300% 0; } }
    .pager { display: flex; align-items: center; justify-content: center; gap: 1.2rem; margin-top: 2rem; color: var(--muted); }
    .pager .btn { padding: .6rem 1.2rem; }
    .empty { padding: 2rem; text-align: center; }
  `],
})
export class RestaurantsComponent {
  private api = inject(RestaurantService);
  private route = inject(ActivatedRoute);

  // Filtres (initialisés depuis l'URL : /restaurants?q=pizza&cuisine=Tunisien)
  query = signal(this.route.snapshot.queryParamMap.get('q') ?? '');
  cuisine = signal(this.route.snapshot.queryParamMap.get('cuisine') ?? 'Tous');
  onlyOpen = signal(false);
  page = signal(1);

  items = signal<Restaurant[]>([]);
  total = signal(0);
  pages = signal(1);
  loading = signal(true);
  error = signal('');

  private reload$ = new Subject<void>();

  constructor() {
    this.reload$
      .pipe(
        debounceTime(200),
        tap(() => { this.loading.set(true); this.error.set(''); }),
        switchMap(() =>
          this.api
            .list({ q: this.query(), cuisine: this.cuisine(), open: this.onlyOpen(), page: this.page(), limit: PAGE_SIZE })
            .pipe(catchError(() => { this.error.set("Impossible de charger les restaurants. Vérifiez que l'API est lancée."); return of(null); }))
        ),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe((res) => {
        if (res) { this.items.set(res.items); this.total.set(res.total); this.pages.set(res.pages); }
        this.loading.set(false);
      });
    this.reload$.next();
  }

  setQuery(v: string) { this.query.set(v); this.page.set(1); this.reload$.next(); }
  setCuisine(v: string) { this.cuisine.set(v); this.page.set(1); this.reload$.next(); }
  toggleOpen() { this.onlyOpen.update((v) => !v); this.page.set(1); this.reload$.next(); }
  go(p: number) { this.page.set(p); this.reload$.next(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  reset() { this.query.set(''); this.cuisine.set('Tous'); this.onlyOpen.set(false); this.page.set(1); this.reload$.next(); }
}
