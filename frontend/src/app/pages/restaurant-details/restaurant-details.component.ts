import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, map, of, startWith, switchMap } from 'rxjs';
import { Dish, RestaurantMenu } from '../../core/models/restaurant.model';
import { CUISINE_TINTS, formatPrice } from '../../core/models/cuisines';
import { RestaurantService } from '../../core/services/restaurant.service';

interface ViewState { data: RestaurantMenu | null; error: string | null; }

@Component({
  selector: 'app-restaurant-details',
  imports: [RouterLink],
  template: `
    @if (state(); as s) {
      @if (s.data; as d) {
        <header class="hero" [style.background]="tint()">
          <div class="container hero-in">
            <a class="back" routerLink="/restaurants">‹ Tous les restaurants</a>
            <div class="id">
              <span class="logo" aria-hidden="true">{{ d.restaurant.icon }}</span>
              <div>
                <h1>{{ d.restaurant.nom }}</h1>
                <p class="desc">{{ d.restaurant.description }}</p>
                <ul class="facts">
                  <li><span class="badge" [class.closed]="!d.restaurant.isOpen">{{ d.restaurant.isOpen ? 'Ouvert' : 'Fermé' }}</span></li>
                  <li>{{ d.restaurant.typeCuisine }}</li>
                  <li>{{ d.restaurant.horaires }}</li>
                  <li>{{ d.restaurant.adresse }}</li>
                  <li><b>Livraison {{ price(d.restaurant.fraisLivraison) }}</b></li>
                </ul>
              </div>
            </div>
          </div>
        </header>

        <div class="container menu">
          <div class="bar">
            <nav class="tabs" aria-label="Catégories du menu">
              @for (s of sections(); track s.id) { <a [href]="'#cat-' + s.id" (click)="jump($event, s.id)">{{ s.nom }}</a> }
            </nav>
            <input class="find" type="search" placeholder="Chercher un plat" aria-label="Chercher un plat"
                   [value]="find()" (input)="find.set($any($event.target).value)">
          </div>

          @for (sec of sections(); track sec.id) {
            <section class="cat" [id]="'cat-' + sec.id">
              <h2>{{ sec.nom }}</h2>
              <div class="dishes">
                @for (dish of sec.dishes; track dish._id) {
                  <article class="dish" [class.off]="!dish.disponible">
                    <span class="thumb" aria-hidden="true">{{ dish.icon }}</span>
                    <div class="info">
                      <h3>{{ dish.nom }}</h3>
                      <p>{{ dish.description }}</p>
                      @if (!dish.disponible) { <span class="na">Indisponible aujourd'hui</span> }
                    </div>
                    <strong class="price">{{ price(dish.prix) }}</strong>
                  </article>
                }
              </div>
            </section>
          } @empty {
            <div class="empty card"><p>Aucun plat ne correspond à « {{ find() }} ».</p></div>
          }
        </div>
      } @else {
        <section class="container err">
          <div class="card box">
            <h1>Oups</h1>
            <p>{{ s.error }}</p>
            <a class="btn btn-primary" routerLink="/restaurants">Voir les restaurants</a>
          </div>
        </section>
      }
    } @else {
      <div class="container load" aria-busy="true">Chargement du menu…</div>
    }
  `,
  styles: [`
    .hero { padding: 1.4rem 0 2rem; border-radius: 0 0 var(--r-lg) var(--r-lg); }
    .back { font-weight: 700; display: inline-block; margin-bottom: 1rem; }
    .id { display: flex; gap: 1.4rem; align-items: center; }
    .logo { width: 96px; height: 96px; flex: none; display: grid; place-items: center; font-size: 3.2rem; background: var(--paper); border-radius: 28px; box-shadow: var(--shadow); }
    h1 { font-size: clamp(1.8rem, 4vw, 2.6rem); color: var(--indigo-dark); margin-bottom: .2rem; }
    .desc { margin: 0 0 .6rem; max-width: 60ch; }
    .facts { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: .4rem 1.1rem; font-size: .92rem; }
    .facts li + li::before { content: '·'; margin-right: 1.1rem; color: var(--muted); }
    .facts li:first-child::before { content: none; }
    .badge { font-size: .75rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; background: #dff1e7; color: var(--ok); }
    .badge.closed { background: #f3e1dc; color: var(--danger); }

    .bar { position: sticky; top: 72px; z-index: 20; display: flex; flex-wrap: wrap; gap: .8rem; align-items: center; justify-content: space-between; padding: .8rem 0; background: var(--cream); }
    .tabs { display: flex; gap: .5rem; overflow-x: auto; scrollbar-width: none; }
    .tabs a { white-space: nowrap; padding: .45rem 1rem; border-radius: 999px; background: var(--paper); color: var(--ink); font-weight: 500; box-shadow: inset 0 0 0 2px var(--line); transition: background .2s, box-shadow .2s; }
    .tabs a:hover { background: var(--indigo-soft); box-shadow: inset 0 0 0 2px var(--indigo); }
    .find { padding: .6rem 1.1rem; border: 0; border-radius: 999px; background: var(--paper); box-shadow: inset 0 0 0 2px var(--line); font: inherit; min-width: 200px; }
    .find:focus { outline: none; box-shadow: inset 0 0 0 2px var(--indigo), 0 0 0 4px var(--indigo-soft); }

    .cat { padding-top: 1.2rem; scroll-margin-top: 150px; }
    .cat h2 { font-size: 1.6rem; }
    .dishes { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1rem; }
    .dish { display: flex; align-items: center; gap: 1rem; padding: 1rem 1.1rem; background: var(--paper); border-radius: var(--r-md); box-shadow: var(--shadow); }
    .thumb { flex: none; width: 60px; height: 60px; display: grid; place-items: center; font-size: 1.9rem; background: var(--cream-2); border-radius: 50%; }
    .info { flex: 1; min-width: 0; }
    .info h3 { font-size: 1.05rem; margin: 0 0 .15rem; }
    .info p { margin: 0; font-size: .88rem; color: var(--muted); line-height: 1.4; }
    .price { font: 700 1.15rem var(--font-display); color: var(--brown); white-space: nowrap; }
    .dish.off { opacity: .62; }
    .dish.off .thumb { filter: grayscale(1); }
    .dish.off .price { text-decoration: line-through; }
    .na { display: inline-block; margin-top: .3rem; font-size: .78rem; font-weight: 700; color: var(--danger); }
    .empty, .box { padding: 2rem; text-align: center; margin-top: 1.5rem; }
    .err { display: grid; place-items: center; padding: 4rem 0; }
    .load { padding: 4rem 0; color: var(--muted); text-align: center; }
    @media (max-width: 600px) { .id { flex-direction: column; align-items: flex-start; } .dishes { grid-template-columns: 1fr; } }
  `],
})
export class RestaurantDetailsComponent {
  private api = inject(RestaurantService);
  private route = inject(ActivatedRoute);

  price = formatPrice;
  find = signal('');

  state = toSignal(
    this.route.paramMap.pipe(
      switchMap((params) =>
        this.api.get(params.get('id') ?? '').pipe(
          map((data): ViewState => ({ data, error: null })),
          catchError((e: HttpErrorResponse): Observable<ViewState> =>
            of({ data: null, error: e.status === 404 ? "Ce restaurant est introuvable ou n'est plus disponible." : 'Impossible de charger le menu pour le moment.' })
          ),
          startWith(null)
        )
      )
    ),
    { initialValue: null }
  );

  tint = computed(() => CUISINE_TINTS[this.state()?.data?.restaurant.typeCuisine ?? ''] ?? '#f1e8cf');

  /** Plats groupés par catégorie, filtrés par la recherche. */
  sections = computed(() => {
    const data = this.state()?.data;
    if (!data) return [];
    const q = this.find().trim().toLowerCase();
    return data.categories
      .map((c) => ({
        id: c._id,
        nom: c.nom,
        dishes: data.dishes.filter((d: Dish) => d.categorie === c._id && (!q || d.nom.toLowerCase().includes(q))),
      }))
      .filter((s) => s.dishes.length > 0);
  });

  jump(event: Event, id: string) {
    event.preventDefault();
    document.getElementById('cat-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
