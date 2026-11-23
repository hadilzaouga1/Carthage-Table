// Page d'un restaurant : infos + menu par catégorie + bouton Ajouter + avis clients.
import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RestaurantService, Restaurant, Category, Dish } from '../core/restaurant.service';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { ReviewService, Review } from '../core/review.service';

const STAR_LABELS: Record<number, string> = {
  1: '1 ★ — Décevant',
  2: '2 ★ — Moyen',
  3: '3 ★ — Correct',
  4: '4 ★ — Très bon',
  5: '5 ★ — Excellent'
};

@Component({
  selector: 'app-restaurant-detail',
  standalone: true,
  imports: [RouterLink, DatePipe],
  template: `
    <section class="section"><div class="container">
      @if (loading()) {
        <p>Chargement du menu...</p>
      } @else if (!restaurant()) {
        <p>Restaurant introuvable.</p>
        <a routerLink="/restaurants" class="btn-ghost">← Retour aux restaurants</a>
      } @else {
        <a routerLink="/restaurants" class="text-link">← Tous les restaurants</a>

        <div class="menu-head">
          <h2>{{ restaurant()!.icon || '🍽️' }} {{ restaurant()!.nom }}</h2>
          <p>{{ restaurant()!.typeCuisine }} · {{ restaurant()!.adresse }}</p>
          <p>{{ restaurant()!.description }}</p>
          <p>
            <strong>{{ restaurant()!.isOpen ? 'Ouvert' : 'Fermé' }}</strong> · {{ restaurant()!.horaires }} · Livraison {{ restaurant()!.fraisLivraison.toFixed(2) }} DT
            · ★ <strong>{{ (restaurant()!.nombreAvis ?? 0) > 0 ? (restaurant()!.noteMoyenne ?? 0).toFixed(1) + ' / 5' : 'Nouveau' }}</strong>
            ({{ restaurant()!.nombreAvis ?? 0 }} avis)
          </p>
        </div>

        @if (!restaurant()!.isOpen) { <p class="notice">Ce restaurant est fermé : vous ne pouvez pas commander pour le moment.</p> }

        @for (c of categories(); track c._id) {
          <h3 class="cat-title">{{ c.nom }}</h3>
          <div class="dish-list">
            @for (d of dishesOf(c._id); track d._id) {
              <div class="dish">
                <div class="dish-icon">{{ d.icon }}</div>
                <div class="dish-info"><strong>{{ d.nom }}</strong><p>{{ d.description }}</p></div>
                <div class="dish-side">
                  <span class="price">{{ d.prix.toFixed(2) }} DT</span>
                  @if (d.disponible && restaurant()!.isOpen) {
                    <button type="button" class="btn-tomato" (click)="add(d)">Ajouter</button>
                  } @else {
                    <span class="unavailable">Indisponible</span>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- Section Avis & Notes -->
        <div class="reviews-section">
          <h3>Avis clients ({{ reviews().length }})</h3>

          <div class="review-form">
            <label>Votre note : <strong>{{ starLabel(note()) }}</strong></label>
            <div class="star-picker" role="radiogroup" aria-label="Choisir une note">
              @for (s of [1, 2, 3, 4, 5]; track s) {
                <button
                  type="button"
                  class="star-btn"
                  [class.active]="note() >= s"
                  (click)="note.set(s)"
                >
                  ★ {{ s }}
                </button>
              }
            </div>

            <label for="review-comment">Votre commentaire (facultatif)</label>
            <textarea
              id="review-comment"
              rows="3"
              placeholder="Partagez votre expérience..."
              [value]="commentaire()"
              (input)="commentaire.set($any($event.target).value)"
            ></textarea>

            @if (reviewError()) { <p class="error">{{ reviewError() }}</p> }
            @if (reviewSuccess()) { <p class="success">{{ reviewSuccess() }}</p> }

            <div class="review-actions">
              <button type="button" class="btn-tomato" [disabled]="submittingReview()" (click)="submitReview()">
                {{ auth.isLoggedIn() ? (submittingReview() ? 'Publication...' : (myReviewId() ? 'Mettre à jour mon avis' : 'Publier mon avis')) : 'Se connecter pour noter' }}
              </button>
              @if (myReviewId()) {
                <button type="button" class="btn-ghost" (click)="deleteMyReview()">Supprimer mon avis</button>
              }
            </div>
          </div>

          @if (!reviews().length) {
            <p class="muted">Aucun avis pour ce restaurant pour le moment.</p>
          } @else {
            <div class="review-list">
              @for (rev of reviews(); track rev._id) {
                <article class="review-card" [class.mine]="rev._id === myReviewId()">
                  <div class="review-head">
                    <strong>
                      {{ authorLabel(rev) }}
                      @if (rev._id === myReviewId()) { <span class="badge-you">Vous</span> }
                      · <span class="stars-gold">{{ '★'.repeat(rev.note) }}{{ '☆'.repeat(5 - rev.note) }}</span> ({{ rev.note }}/5)
                    </strong>
                    <span>{{ rev.createdAt | date: 'dd/MM/yyyy' }}</span>
                  </div>
                  @if (rev.commentaire) {
                    <p class="review-body">{{ rev.commentaire }}</p>
                  }
                </article>
              }
            </div>
          }
        </div>

        <!-- Barre du panier, visible dès qu'il y a un plat -->
        @if (cart.count() > 0) {
          <a routerLink="/panier" class="btn-tomato cart-bar">Voir mon panier ({{ cart.count() }}) · {{ cart.sousTotal().toFixed(2) }} DT</a>
        }
      }
    </div></section>
  `,
  styles: [`
    .menu-head { margin: 16px 0 24px; }
    .notice { padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(220,60,60,.5); margin-bottom: 16px; }
    .cat-title { margin: 28px 0 12px; }
    .dish-list { display: grid; gap: 12px; }
    .dish { display: flex; align-items: center; gap: 16px; padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; }
    .dish-icon { font-size: 2rem; }
    .dish-info { flex: 1; }
    .dish-info p { margin: 4px 0 0; opacity: .7; font-size: .9rem; }
    .dish-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; }
    .price { font-weight: 700; }
    .unavailable { opacity: .6; font-size: .9rem; }
    .reviews-section { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(128,128,128,.25); }
    .review-form { display: grid; gap: 10px; max-width: 540px; margin: 16px 0 24px; }
    .star-picker { display: flex; flex-wrap: wrap; gap: 8px; }
    .star-btn { padding: 8px 14px; border-radius: 999px; border: 1px solid rgba(128,128,128,.45); background: transparent; color: inherit; font: inherit; font-weight: 700; cursor: pointer; transition: all .15s ease; }
    .star-btn.active { background: #e8590c; border-color: #e8590c; color: #fff; }
    .review-form textarea { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .review-actions { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }
    .review-list { display: grid; gap: 12px; max-width: 720px; }
    .review-card { padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .review-card.mine { border-color: #e8590c; }
    .review-head { display: flex; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .stars-gold { color: #f59f00; letter-spacing: 1px; }
    .badge-you { display: inline-block; margin-left: 6px; padding: 2px 8px; border-radius: 999px; background: rgba(232,89,12,.2); color: #e8590c; font-size: .78rem; }
    .review-body { margin: 8px 0 0; }
    .muted { opacity: .75; }
    .error { color: #e5484d; font-weight: 600; margin: 0; }
    .success { color: #2f9e44; font-weight: 600; margin: 0; }
    .cart-bar { position: fixed; left: 50%; bottom: 20px; transform: translateX(-50%); z-index: 50; box-shadow: 0 6px 24px rgba(0,0,0,.3); }
  `]
})
export class RestaurantDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(RestaurantService);
  private reviewService = inject(ReviewService);
  auth = inject(AuthService);
  cart = inject(CartService);

  loading = signal(true);
  restaurant = signal<Restaurant | null>(null);
  categories = signal<Category[]>([]);
  dishes = signal<Dish[]>([]);
  reviews = signal<Review[]>([]);

  myReviewId = signal<string | null>(null);
  note = signal(5);
  commentaire = signal('');
  submittingReview = signal(false);
  reviewError = signal('');
  reviewSuccess = signal('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.service.getOne(id).subscribe({
      next: (res) => {
        this.restaurant.set(res.restaurant);
        this.categories.set(res.categories);
        this.dishes.set(res.dishes);
        this.loading.set(false);
        this.loadReviews(id);
      },
      error: () => { this.restaurant.set(null); this.loading.set(false); }
    });
  }

  starLabel(n: number) {
    return STAR_LABELS[n] || `${n} ★`;
  }

  loadReviews(id: string) {
    this.reviewService.listByRestaurant(id).subscribe({
      next: (res) => {
        const list = res.reviews || [];
        this.reviews.set(list);

        // Si l'utilisateur connecté a déjà publié un avis sur ce restaurant, on pré-remplit le formulaire
        const currentUser = this.auth.user() as any;
        const currentUserId = currentUser?.id || currentUser?._id;
        const existing = currentUserId
          ? list.find((rev) => {
              const authorId = typeof rev.client === 'object' ? rev.client?._id : rev.client;
              return authorId && String(authorId) === String(currentUserId);
            })
          : undefined;

        if (existing) {
          this.myReviewId.set(existing._id);
          this.note.set(existing.note);
          this.commentaire.set(existing.commentaire || '');
        } else {
          this.myReviewId.set(null);
        }

        const current = this.restaurant();
        if (current) {
          this.restaurant.set({
            ...current,
            noteMoyenne: res.noteMoyenne,
            nombreAvis: res.nombreAvis
          });
        }
      },
      error: () => this.reviews.set([])
    });
  }

  submitReview() {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const r = this.restaurant();
    if (!r) return;

    this.reviewError.set('');
    this.reviewSuccess.set('');
    this.submittingReview.set(true);

    this.reviewService.submitReview({
      restaurant: r._id,
      note: this.note(),
      commentaire: this.commentaire().trim()
    }).subscribe({
      next: (res) => {
        this.submittingReview.set(false);
        this.reviewSuccess.set('Votre avis a été enregistré.');
        this.restaurant.set({
          ...r,
          noteMoyenne: res.noteMoyenne,
          nombreAvis: res.nombreAvis
        });
        this.loadReviews(r._id);
      },
      error: (err) => {
        this.submittingReview.set(false);
        this.reviewError.set(err.error?.message || "Impossible d'enregistrer l'avis.");
      }
    });
  }

  deleteMyReview() {
    const id = this.myReviewId();
    const r = this.restaurant();
    if (!id || !r) return;
    if (!confirm('Supprimer votre avis ?')) return;

    this.reviewService.deleteReview(id).subscribe({
      next: (res) => {
        this.myReviewId.set(null);
        this.note.set(5);
        this.commentaire.set('');
        this.reviewSuccess.set('Votre avis a été supprimé.');
        this.restaurant.set({
          ...r,
          noteMoyenne: res.noteMoyenne,
          nombreAvis: res.nombreAvis
        });
        this.loadReviews(r._id);
      },
      error: (err) => {
        this.reviewError.set(err.error?.message || "Impossible de supprimer l'avis.");
      }
    });
  }

  authorLabel(rev: Review): string {
    if (rev.client && typeof rev.client === 'object') {
      return `${rev.client.prenom || ''} ${rev.client.nom || ''}`.trim() || 'Client';
    }
    return 'Client';
  }

  // Les plats d'une catégorie
  dishesOf(categoryId: string) { return this.dishes().filter((d) => d.categorie === categoryId); }

  // Ajouter au panier (un panier = un seul restaurant)
  add(d: Dish) {
    const r = this.restaurant();
    if (!r) return;
    if (this.cart.count() > 0 && this.cart.restaurantId() !== r._id) {
      if (!confirm('Votre panier contient des plats d\'un autre restaurant. Le vider pour commencer un nouveau panier ?')) return;
      this.cart.clear();
    }
    this.cart.add(r, d);
  }
}