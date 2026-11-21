import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RestaurantService } from '../../core/services/restaurant.service';
import { Restaurant } from '../../core/models/restaurant.model';
import { RestaurantCardComponent } from '../../shared/restaurant-card/restaurant-card.component';
import { CuisineTabsComponent } from '../../shared/cuisine-tabs/cuisine-tabs.component';

interface CartLine { nom: string; icon: string; prix: number; qty: number; }

@Component({
  selector: 'app-home',
  imports: [RouterLink, RestaurantCardComponent, CuisineTabsComponent],
  template: `
    <!-- HERO -->
    <section class="hero">
      <div class="container hero-grid">
        <div class="hero-text">
          <p class="script step s1">réveillez vos sens</p>
          <h1 class="step s2">Vos plats préférés, livrés chauds à votre porte.</h1>
          <p class="lead step s3">Choisissez un restaurant, composez votre panier, suivez votre commande en direct. Carthage Table s'occupe du reste.</p>

          <form class="search step s4" role="search" (submit)="$event.preventDefault(); goSearch()">
            <input type="search" placeholder="Pizza, couscous, tiramisu…" aria-label="Rechercher un restaurant"
                   [value]="query()" (input)="query.set($any($event.target).value)">
            <button class="btn btn-primary" type="submit">Rechercher</button>
          </form>

          <div class="cta step s5">
            <a class="btn btn-brown" href="#restaurants">Commander maintenant</a>
            @if (!auth.isLoggedIn()) { <a class="btn btn-ghost" routerLink="/register">Créer un compte</a> }
          </div>
        </div>

        <!-- Le panier interactif : le moment mémorable de la page -->
        <aside class="phone step s3" aria-label="Exemple de panier">
          <div class="phone-top"><span class="notch"></span></div>
          <div class="phone-body">
            <h2>Mon panier</h2>
            @for (l of cart(); track l.nom) {
              <div class="line">
                <span class="thumb" aria-hidden="true">{{ l.icon }}</span>
                <div class="info"><b>{{ l.nom }}</b><small>{{ l.prix }} DT</small></div>
                <div class="qty">
                  <button type="button" (click)="change(l.nom, -1)" [attr.aria-label]="'Retirer ' + l.nom">−</button>
                  <span>{{ l.qty }}</span>
                  <button type="button" (click)="change(l.nom, 1)" [attr.aria-label]="'Ajouter ' + l.nom">+</button>
                </div>
              </div>
            }
            <dl class="sum">
              <div><dt>Sous-total</dt><dd>{{ subTotal() }} DT</dd></div>
              <div><dt>Livraison</dt><dd>{{ subTotal() > 0 ? deliveryFee : 0 }} DT</dd></div>
            </dl>
            <div class="buy">
              <div><small>Total</small><strong>{{ total() }} DT</strong></div>
              <button class="btn btn-brown" type="button" [disabled]="subTotal() === 0" (click)="buy()">
                {{ bought() ? 'Commande envoyée' : 'Commander' }}
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- CUISINES + RESTAURANTS -->
    <section class="section" id="restaurants">
      <div class="container">
        <h2>Qu'avez-vous envie de manger ?</h2>

        <app-cuisine-tabs [value]="cuisine()" (valueChange)="pickCuisine($event)" />

        <div class="toolbar">
          <label class="chip"><input type="checkbox" [checked]="onlyOpen()" (change)="toggleOpen()"> Ouverts maintenant</label>
          <a class="all" routerLink="/restaurants">Voir tous les restaurants</a>
        </div>

        @if (error()) {
          <div class="alert alert-error" role="alert">{{ error() }}</div>
        } @else if (loading() && !restaurants().length) {
          <div class="grid" aria-busy="true">@for (i of [1,2,3,4]; track i) { <div class="sk"></div> }</div>
        } @else if (restaurants().length) {
          <div class="grid" [class.dim]="loading()">
            @for (r of restaurants(); track r._id) { <app-restaurant-card [restaurant]="r" /> }
          </div>
        } @else {
          <div class="empty card">
            <p>Aucun restaurant dans cette catégorie pour le moment.</p>
            <button class="btn btn-ghost" type="button" (click)="reset()">Voir toutes les cuisines</button>
          </div>
        }
      </div>
    </section>

    <!-- COMMENT CA MARCHE : vraie séquence, donc numérotée -->
    <section class="section how" id="comment">
      <div class="container">
        <h2>Trois étapes, zéro prise de tête</h2>
        <ol class="steps">
          <li class="card"><span class="n">1</span><h3>Choisissez</h3><p>Parcourez les restaurants ouverts et leurs menus, filtrez par cuisine.</p></li>
          <li class="card"><span class="n">2</span><h3>Commandez</h3><p>Composez votre panier, indiquez votre adresse et payez à la livraison.</p></li>
          <li class="card"><span class="n">3</span><h3>Savourez</h3><p>Suivez le statut de votre commande jusqu'à votre porte. Saha !</p></li>
        </ol>
      </div>
    </section>

    @if (!auth.isLoggedIn()) {
      <section class="container">
        <div class="band">
          <div>
            <h2>Prêt à passer votre première commande ?</h2>
            <p>Un compte gratuit, et vos commandes se retrouvent au même endroit.</p>
          </div>
          <a class="btn btn-brown" routerLink="/register">Créer mon compte</a>
        </div>
      </section>
    }
  `,
  styles: [`
    /* ---- une seule séquence d'entrée orchestrée, au chargement ---- */
    .step { animation: rise .7s var(--ease) both; }
    .s1 { animation-delay: .05s } .s2 { animation-delay: .15s } .s3 { animation-delay: .27s }
    .s4 { animation-delay: .38s } .s5 { animation-delay: .48s }
    @keyframes rise { from { opacity: 0; transform: translateY(18px); } }

    .hero { padding: 3rem 0 2rem; background:
      radial-gradient(circle at 90% 10%, var(--indigo-soft) 0, transparent 38%),
      radial-gradient(circle at 0% 100%, var(--cream-2) 0, transparent 40%); }
    .hero-grid { display: grid; grid-template-columns: 1.15fr .85fr; gap: 3rem; align-items: center; }
    .hero h1 { font-size: clamp(2.3rem, 5vw, 3.7rem); max-width: 14ch; color: var(--indigo-dark); }
    .lead { font-size: 1.1rem; color: var(--muted); max-width: 46ch; }
    .search { display: flex; gap: .5rem; padding: .4rem; background: var(--paper); border-radius: 999px; box-shadow: var(--shadow); max-width: 480px; margin-bottom: 1.2rem; }
    .search input { flex: 1; min-width: 0; border: 0; background: transparent; padding: 0 1rem; font: inherit; color: var(--ink); }
    .search input:focus { outline: none; }
    .search:focus-within { box-shadow: 0 0 0 4px var(--indigo-soft), var(--shadow); }
    .cta { display: flex; flex-wrap: wrap; gap: .8rem; }

    /* téléphone */
    .phone { width: min(330px, 100%); margin-inline: auto; background: var(--paper); border: 9px solid var(--ink); border-radius: 44px; box-shadow: var(--shadow-lift); overflow: hidden; transform: rotate(2.5deg); transition: transform .4s var(--ease); }
    .phone:hover { transform: rotate(0); }
    .phone-top { height: 28px; background: var(--ink); display: grid; place-items: center; }
    .notch { width: 70px; height: 8px; border-radius: 8px; background: #000; }
    .phone-body { padding: 1.1rem 1.1rem 1.2rem; background: var(--cream); }
    .phone-body h2 { font-size: 1.5rem; margin-bottom: .8rem; }
    .line { display: flex; align-items: center; gap: .7rem; padding: .6rem .7rem; margin-bottom: .6rem; background: var(--paper); border-radius: 16px; box-shadow: 0 8px 16px -12px rgba(74,74,140,.5); }
    .thumb { font-size: 1.7rem; width: 44px; height: 44px; display: grid; place-items: center; background: var(--cream-2); border-radius: 50%; }
    .info { flex: 1; display: grid; line-height: 1.25; }
    .info small { color: var(--muted); }
    .qty { display: flex; align-items: center; gap: .35rem; }
    .qty button { width: 28px; height: 28px; border-radius: 50%; border: 0; background: var(--indigo-soft); color: var(--indigo-dark); font-weight: 700; cursor: pointer; transition: background .2s, transform .15s; }
    .qty button:hover { background: var(--indigo); color: #fff; }
    .qty button:active { transform: scale(.88); }
    .qty span { min-width: 1.1rem; text-align: center; font-weight: 700; }
    .sum { margin: .8rem 0; font-size: .9rem; color: var(--muted); }
    .sum div { display: flex; justify-content: space-between; }
    .sum dt, .sum dd { margin: 0; }
    .buy { display: flex; align-items: center; justify-content: space-between; }
    .buy small { display: block; color: var(--muted); line-height: 1; }
    .buy strong { font: 700 1.5rem var(--font-display); }
    .buy .btn { padding: .7rem 1.2rem; font-size: .9rem; }

    /* sections */
    .section { padding: 3.5rem 0 1rem; }
    .section h2 { font-size: clamp(1.7rem, 3vw, 2.3rem); }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin: .6rem 0 1.4rem; }
    .chip { display: inline-flex; align-items: center; gap: .45rem; padding: .45rem .9rem; border-radius: 999px; background: var(--paper); box-shadow: inset 0 0 0 2px var(--line); cursor: pointer; font-size: .9rem; }
    .chip:has(input:checked) { background: var(--indigo-soft); box-shadow: inset 0 0 0 2px var(--indigo); }
    .chip input { accent-color: var(--indigo); }
    .all { margin-left: auto; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 1.4rem; transition: opacity .2s; }
    .grid.dim { opacity: .55; }
    .sk { height: 232px; border-radius: var(--r-md); background: linear-gradient(100deg, var(--cream-2) 30%, var(--paper) 50%, var(--cream-2) 70%) 0 0 / 300% 100%; animation: shimmer 1.4s linear infinite; }
    @keyframes shimmer { to { background-position: -300% 0; } }
    .empty { padding: 2rem; text-align: center; }

    .steps { list-style: none; padding: 0; margin: 1.6rem 0 0; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.4rem; }
    .steps li { padding: 1.6rem; }
    .n { width: 44px; height: 44px; display: grid; place-items: center; border-radius: 50%; background: var(--indigo); color: #fff; font: 700 1.2rem var(--font-display); margin-bottom: 1rem; }
    .steps h3 { font-size: 1.25rem; }
    .steps p { color: var(--muted); margin: 0; }

    .band { margin-top: 3.5rem; padding: 2.2rem 2.4rem; border-radius: var(--r-lg); background: var(--indigo); color: #fff; display: flex; flex-wrap: wrap; gap: 1.4rem; align-items: center; justify-content: space-between; }
    .band h2 { color: #fff; font-size: 1.7rem; margin-bottom: .3rem; }
    .band p { margin: 0; opacity: .85; }

    @media (max-width: 900px) {
      .hero-grid { grid-template-columns: 1fr; }
      .phone { transform: none; }
      .steps { grid-template-columns: 1fr; }
    }
  `],
})
export class HomeComponent {
  auth = inject(AuthService);
  readonly deliveryFee = 5;

  private api = inject(RestaurantService);
  private router = inject(Router);

  // Restaurants populaires, chargés depuis l'API
  query = signal('');
  cuisine = signal('Tous');
  onlyOpen = signal(false);
  restaurants = signal<Restaurant[]>([]);
  loading = signal(true);
  error = signal('');

  private reload$ = new Subject<void>();

  constructor() {
    this.reload$
      .pipe(
        tap(() => { this.loading.set(true); this.error.set(''); }),
        switchMap(() =>
          this.api.list({ cuisine: this.cuisine(), open: this.onlyOpen(), limit: 8 }).pipe(
            catchError(() => { this.error.set("Impossible de charger les restaurants. Vérifiez que l'API est lancée."); return of(null); })
          )
        ),
        takeUntilDestroyed(inject(DestroyRef))
      )
      .subscribe((res) => {
        if (res) this.restaurants.set(res.items);
        this.loading.set(false);
      });
    this.reload$.next();
  }

  pickCuisine(key: string) { this.cuisine.set(key); this.reload$.next(); }
  toggleOpen() { this.onlyOpen.update((v) => !v); this.reload$.next(); }

  // Panier de démonstration (même exemple que le cahier des charges : 40 DT + 5 DT = 45 DT)
  cart = signal<CartLine[]>([
    { nom: 'Pizza Margherita', icon: '🍕', prix: 15, qty: 2 },
    { nom: 'Coca-Cola', icon: '🥤', prix: 3, qty: 1 },
    { nom: 'Tiramisu', icon: '🍰', prix: 7, qty: 1 },
  ]);
  subTotal = computed(() => this.cart().reduce((s, l) => s + l.prix * l.qty, 0));
  total = computed(() => this.subTotal() + (this.subTotal() > 0 ? this.deliveryFee : 0));
  bought = signal(false);

  change(nom: string, delta: number) {
    this.bought.set(false);
    this.cart.update((lines) => lines.map((l) => (l.nom === nom ? { ...l, qty: Math.max(0, l.qty + delta) } : l)));
  }

  buy() {
    this.bought.set(true);
    setTimeout(() => this.bought.set(false), 2200);
  }

  goSearch() {
    this.router.navigate(['/restaurants'], { queryParams: this.query().trim() ? { q: this.query().trim() } : {} });
  }

  reset() {
    this.cuisine.set('Tous');
    this.onlyOpen.set(false);
    this.reload$.next();
  }
}
