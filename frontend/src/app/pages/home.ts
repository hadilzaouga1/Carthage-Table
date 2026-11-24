// Page d'accueil (design Lovable) : hero, bandeau, restaurants par cuisine, 3 étapes, appel aux restaurateurs.
import { Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant } from '../core/restaurant.service';
import { CuisineService } from '../core/cuisine.service';
import { RestaurantCard } from '../shared/restaurant-card';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, RestaurantCard, Icon],
  template: `
    <!-- HERO : le premier écran annonce la marque et le plaisir de manger -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <div class="location-tag"><app-icon name="map-pin"></app-icon>De nos cuisines à votre table · Tunis</div>
          <h1>La Tunisie<br />a <span class="highlight">bon goût.</span></h1>
          <p class="hero-description">Vos restaurants préférés. Des plats qui font envie.<br />Et tout le plaisir de bien manger, livré chez vous.</p>
          <!-- Barre de recherche : envoie vers la liste des restaurants, déjà filtrée -->
          <form class="hero-search" role="search" (submit)="search($event)">
            <div class="search-box">
              <app-icon name="search"></app-icon>
              <input class="field" type="search" name="q" placeholder="Pizza, couscous, burger…" aria-label="Rechercher un restaurant"
                     [value]="query()" (input)="query.set($any($event.target).value)" />
            </div>
            <button type="submit" class="btn-tomato">Rechercher</button>
          </form>
          <div class="hero-buttons">
            <a routerLink="/restaurants" class="btn-tomato">J’ai faim, je commande <app-icon name="arrow-right"></app-icon></a>
            <a href="#comment-ca-marche" class="btn-soft">Comment ça marche ?</a>
          </div>
          <div class="social-proof">
            <div class="proof-rating">
              <span class="stars">@for (s of [1,2,3,4,5]; track s) { <app-icon name="star"></app-icon> }</span>
              <p><strong>Du bonheur</strong> à chaque bouchée</p>
            </div>
          </div>
        </div>
        <div class="hero-art">
          <app-icon name="sparkles" class="hero-spark"></app-icon>
          <img class="hero-pizza" src="img/pizza.png" alt="Grande pizza garnie de mozzarella, basilic et olives" />
          <div class="food-stamp"><small>CHAUD DEVANT !</small>100 %<br />gourmand</div>
          <div class="delivery-note">
            <div class="note-icon"><app-icon name="bike"></app-icon></div>
            <div><strong>Votre envie, notre mission.</strong><p>Livré chaud. Dégusté heureux.</p></div>
          </div>
          <app-icon name="leaf" class="hero-leaf"></app-icon>
        </div>
      </div>
    </section>

    <!-- Bandeau animé en CSS (léger pour le processeur) -->
    <div class="marquee"><div class="marquee-track">
      @for (copy of [0, 1]; track copy) {
        <span class="flex items-center gap-10">
          @for (t of slogans; track t) { <span class="flex items-center gap-10"><app-icon name="sparkles"></app-icon>{{ t }}</span> }
        </span>
      }
    </div></div>

    <!-- Restaurants : filtre par type de cuisine, données venant de l'API -->
    <section class="section"><div class="container">
      <div class="section-heading">
        <div><p class="eyebrow">LES BONNES ADRESSES, LES VRAIES.</p><h2>Au menu ce soir<span class="text-primary">.</span></h2></div>
        <a routerLink="/restaurants" class="text-link">Tous les restaurants <app-icon name="arrow-right"></app-icon></a>
      </div>
      <div class="cuisine-row">
        @for (c of cuisines(); track c.name) {
          <button type="button" class="btn-ghost cuisine-button" [class.selected]="cuisine() === c.name" (click)="choose(c.name)">
            <app-icon [name]="c.icon"></app-icon>{{ c.label }}
          </button>
        }
      </div>
      <div class="restaurant-grid">
        @for (r of restaurants(); track r._id) { <app-restaurant-card [r]="r" /> }
      </div>
      @if (!restaurants().length) { <p class="results-count">Aucun restaurant pour cette cuisine pour le moment.</p> }
    </div></section>

    <!-- 3 étapes -->
    <section class="steps-section" id="comment-ca-marche"><div class="container">
      <div class="steps-heading"><p class="eyebrow">MOINS D’ATTENTE. PLUS DE PLAISIR.</p><h2>À table en trois étapes.</h2></div>
      <div class="steps-grid">
        @for (s of steps; track s.title; let i = $index) {
          <div>
            <div class="step-icon"><app-icon [name]="s.icon"></app-icon><span class="step-number">0{{ i + 1 }}</span></div>
            <h3>{{ s.title }}</h3><p>{{ s.text }}</p>
          </div>
        }
      </div>
    </div></section>

    <div class="container callout">
      <div><h2>Votre cuisine mérite sa place à table.</h2><p>Restaurateurs, partageons le goût des bonnes choses.</p></div>
      <a routerLink="/register" class="btn-gold">Devenir partenaire <app-icon name="arrow-right"></app-icon></a>
    </div>
  `,
  styles: [`
    .hero-search { display: flex; gap: 10px; max-width: 520px; margin: 0 0 22px; }
    .hero-search .btn-tomato { flex-shrink: 0; }
  `]
})
export class Home implements OnInit {
  private service = inject(RestaurantService);
  private cuisineApi = inject(CuisineService);
  private router = inject(Router);

  restaurants = signal<Restaurant[]>([]); // restaurants affichés
  cuisine = signal('Tous');               // cuisine sélectionnée
  query = signal('');                     // texte de la barre de recherche

  // Les cuisines viennent de l'API (gérées par l'administrateur). « Tous » est toujours en premier.
  cuisines = signal<{ name: string; label: string; icon: string }[]>([{ name: 'Tous', label: 'Tous', icon: 'utensils' }]);
  slogans = ['Bon appétit, بالشفاء !', 'Du frais. Du bon. Du local.', 'Votre prochaine envie est ici.', 'La Tunisie à votre table.'];
  steps = [
    { icon: 'search', title: 'Trouvez votre bonheur', text: 'Une envie de pizza, de burger ou de saveurs du pays ? Choisissez votre restaurant.' },
    { icon: 'shopping-bag', title: 'Composez votre festin', text: 'Vos plats préférés, quelques clics et une adresse. On s’occupe de la suite.' },
    { icon: 'bike', title: 'Savourez, tout simplement', text: 'Votre repas arrive à votre porte. Payez à la livraison et régalez-vous.' }
  ];
  ngOnInit() {
    this.cuisineApi.list().subscribe((list) =>
      this.cuisines.set([{ name: 'Tous', label: 'Tous', icon: 'utensils' }, ...list.map((c) => ({ name: c.nom, label: c.nom, icon: c.icon || 'utensils' }))])
    );
    this.load();
  }

  // Recherche depuis l'accueil : on ouvre la liste des restaurants avec le texte saisi
  search(event: Event) {
    event.preventDefault();
    const text = this.query().trim();
    this.router.navigate(['/restaurants'], { queryParams: text ? { search: text } : {} });
  }

  // Choisir une cuisine puis recharger la liste
  choose(name: string) { this.cuisine.set(name); this.load(); }

  // Appel API : 3 restaurants maximum sur l'accueil
  private load() {
    const typeCuisine = this.cuisine() === 'Tous' ? undefined : this.cuisine();
    this.service.list({ typeCuisine, limit: 6 }).subscribe({
      next: res => this.restaurants.set(res.restaurants),
      error: () => this.restaurants.set([])
    });
  }
}