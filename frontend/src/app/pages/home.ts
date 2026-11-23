// Page d'accueil (design Lovable) : hero, bandeau, restaurants par cuisine, derniers avis, 3 étapes, appel aux restaurateurs.
import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RestaurantService, Restaurant } from '../core/restaurant.service';
import { ReviewService, Review } from '../core/review.service';
import { RestaurantCard } from '../shared/restaurant-card';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, DatePipe, RestaurantCard, Icon],
  template: `
    <!-- HERO : le premier écran annonce la marque et le plaisir de manger -->
    <section class="hero">
      <div class="container hero-inner">
        <div class="hero-copy">
          <div class="location-tag"><app-icon name="map-pin"></app-icon>De nos cuisines à votre table · Tunis</div>
          <h1>La Tunisie<br />a <span class="highlight">bon goût.</span></h1>
          <p class="hero-description">Vos restaurants préférés. Des plats qui font envie.<br />Et tout le plaisir de bien manger, livré chez vous.</p>
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
        @for (c of cuisines; track c.name) {
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

    <!-- Section Avis Clients : jusqu'à 3 derniers avis affichés sans lien -->
    <section class="section home-reviews"><div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">ILS ONT GOÛTÉ, ILS RACONTENT.</p>
          <h2>Les derniers avis<span class="text-primary">.</span></h2>
        </div>
      </div>

      @if (!latestReviews().length) {
        <p class="results-count">Aucun avis publié pour le moment. Soyez le premier à noter votre restaurant préféré !</p>
      } @else {
        <div class="home-reviews-grid">
          @for (rev of latestReviews(); track rev._id) {
            <article class="home-review-card">
              <div class="home-review-top">
                <span class="home-review-stars">{{ '★'.repeat(rev.note) }}{{ '☆'.repeat(5 - rev.note) }}</span>
                <small>{{ rev.createdAt | date: 'dd/MM/yyyy' }}</small>
              </div>
              <p class="home-review-text">
                {{ rev.commentaire ? '« ' + rev.commentaire + ' »' : 'Note attribuée : ' + rev.note + '/5' }}
              </p>
              <div class="home-review-foot">
                <strong>{{ authorName(rev) }}</strong>
                <span class="restaurant-label">{{ restaurantNameOf(rev) }}</span>
              </div>
            </article>
          }
        </div>
      }
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
    .home-reviews { padding-top: 12px; }
    .home-reviews-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 18px; }
    .home-review-card { padding: 18px 20px; border: 1px solid rgba(128,128,128,.28); border-radius: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; }
    .home-review-top { display: flex; justify-content: space-between; align-items: center; }
    .home-review-stars { color: #f59f00; font-size: 1.05rem; letter-spacing: 1px; }
    .home-review-text { margin: 0; line-height: 1.5; opacity: .9; }
    .home-review-foot { display: flex; justify-content: space-between; align-items: center; gap: 10px; padding-top: 10px; border-top: 1px solid rgba(128,128,128,.2); font-size: .9rem; }
    .restaurant-label { color: #e8590c; font-weight: 600; }
  `]
})
export class Home implements OnInit {
  private service = inject(RestaurantService);
  private reviewService = inject(ReviewService);

  restaurants = signal<Restaurant[]>([]); // restaurants affichés
  latestReviews = signal<Review[]>([]);     // jusqu'à 3 derniers avis clients
  cuisine = signal('Tous');               // cuisine sélectionnée

  cuisines = [
    { name: 'Tous', label: 'Tous', icon: 'utensils' }, { name: 'Pizza', label: 'Pizzas', icon: 'pizza' },
    { name: 'Fast-food', label: 'Burgers', icon: 'sandwich' }, { name: 'Tunisien', label: 'Tunisien', icon: 'utensils' },
    { name: 'Italien', label: 'Pâtes', icon: 'utensils' }, { name: 'Desserts', label: 'Desserts', icon: 'cake-slice' }
  ];
  slogans = ['Bon appétit, بالشفاء !', 'Du frais. Du bon. Du local.', 'Votre prochaine envie est ici.', 'La Tunisie à votre table.'];
  steps = [
    { icon: 'search', title: 'Trouvez votre bonheur', text: 'Une envie de pizza, de burger ou de saveurs du pays ? Choisissez votre restaurant.' },
    { icon: 'shopping-bag', title: 'Composez votre festin', text: 'Vos plats préférés, quelques clics et une adresse. On s’occupe de la suite.' },
    { icon: 'bike', title: 'Savourez, tout simplement', text: 'Votre repas arrive à votre porte. Payez à la livraison et régalez-vous.' }
  ];

  ngOnInit() {
    this.load();
    this.loadLatestReviews();
  }

  choose(name: string) { this.cuisine.set(name); this.load(); }

  authorName(rev: Review): string {
    if (rev.client && typeof rev.client === 'object') {
      return `${rev.client.prenom || ''} ${rev.client.nom || ''}`.trim() || 'Client';
    }
    return 'Client';
  }

  restaurantNameOf(rev: Review): string {
    if (rev.restaurant && typeof rev.restaurant === 'object') {
      return rev.restaurant.nom || '';
    }
    return '';
  }

  private load() {
    const typeCuisine = this.cuisine() === 'Tous' ? undefined : this.cuisine();
    this.service.list({ typeCuisine, limit: 6 }).subscribe({
      next: res => this.restaurants.set(res.restaurants),
      error: () => this.restaurants.set([])
    });
  }

  private loadLatestReviews() {
    this.reviewService.latest(3).subscribe({
      next: res => this.latestReviews.set(res.reviews || []),
      error: () => this.latestReviews.set([])
    });
  }
}