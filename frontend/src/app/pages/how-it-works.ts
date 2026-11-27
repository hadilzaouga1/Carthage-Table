// Page « Comment ça marche ? » : le parcours d'une commande, de la recherche jusqu'au prix final.
// Les règles de prix (remise, livraison offerte) reprennent celles du panier (CartService).
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../core/icon';

type PromoChoice = 'none' | 'RESTORA10' | 'BIENVENUE';

@Component({
  selector: 'app-how-it-works',
  standalone: true,
  imports: [RouterLink, Icon],
  template: `
    <section class="how-hero"><div class="container">
      <p class="eyebrow">DE L’ENVIE À LA PORTE</p>
      <h1>Comment ça marche<span class="text-primary">.</span></h1>
      <p class="how-intro">Six étapes simples, du moment où vous ouvrez Restora jusqu’au moment où vous payez votre repas.</p>
    </div></section>

    <!-- PARCOURS DE COMMANDE -->
    <section class="section"><div class="container">
      <ol class="timeline">
        @for (s of steps; track s.title; let i = $index) {
          <li class="timeline-item">
            <div class="step-icon"><app-icon [name]="s.icon"></app-icon><span class="step-number">0{{ i + 1 }}</span></div>
            <div class="timeline-body">
              <h3>{{ s.title }}</h3>
              <p>{{ s.text }}</p>
              @if (s.tag) { <span class="tag">{{ s.tag }}</span> }
            </div>
          </li>
        }
      </ol>
    </div></section>

    <!-- SUIVI DE COMMANDE -->
    <section class="steps-section"><div class="container">
      <div class="steps-heading"><p class="eyebrow">SUIVEZ VOTRE COMMANDE</p><h2>Un statut à chaque étape.</h2></div>
      <div class="status-row">
        @for (st of statuses; track st.label; let i = $index) {
          <div class="status"><span class="status-dot">{{ i + 1 }}</span><strong>{{ st.label }}</strong><small>{{ st.text }}</small></div>
        }
      </div>
      <p class="status-note">Vous pouvez annuler votre commande tant qu’elle est « en attente ». Une fois acceptée par le restaurant, elle ne peut plus l’être.</p>
    </div></section>

    <!-- CALCUL DU PRIX -->
    <section class="section"><div class="container">
      <div class="section-heading"><div><p class="eyebrow">TRANSPARENT, SANS SURPRISE.</p><h2>Comment le prix est calculé<span class="text-primary">.</span></h2></div></div>
      <p class="formula"><strong>Total</strong> = (sous-total − remise) + frais de livraison</p>

      <div class="price-grid">
        <div class="price-card">
          <h3>Exemple : 2 plats à 12 DT</h3>
          <div class="promo-switch" role="group" aria-label="Choisir un code promo pour l’exemple">
            <button type="button" class="btn-ghost" [class.selected]="promo() === 'none'" (click)="promo.set('none')">Sans code</button>
            <button type="button" class="btn-ghost" [class.selected]="promo() === 'RESTORA10'" (click)="promo.set('RESTORA10')">RESTORA10</button>
            <button type="button" class="btn-ghost" [class.selected]="promo() === 'BIENVENUE'" (click)="promo.set('BIENVENUE')">BIENVENUE</button>
          </div>
          <div class="price-line"><span>Sous-total (2 × {{ unit.toFixed(2) }} DT)</span><span>{{ sousTotal().toFixed(2) }} DT</span></div>
          @if (remise() > 0) { <div class="price-line discount"><span>Remise RESTORA10 (−10 %)</span><span>−{{ remise().toFixed(2) }} DT</span></div> }
          <div class="price-line"><span>Livraison (exemple : {{ delivery.toFixed(2) }} DT)</span><span>{{ frais().toFixed(2) }} DT</span></div>
          <div class="price-line total"><span>Total à payer</span><span>{{ total().toFixed(2) }} DT</span></div>
        </div>

        <div class="price-info">
          <h3>Bon à savoir</h3>
          <ul>
            <li><strong>Frais de livraison :</strong> fixés par chaque restaurant, ils sont affichés avant la validation.</li>
            <li><strong>RESTORA10 :</strong> 10 % de réduction sur le sous-total.</li>
            <li><strong>BIENVENUE :</strong> livraison offerte.</li>
            <li><strong>Paiement :</strong> en espèces à la livraison. Le paiement en ligne arrive bientôt.</li>
            <li><strong>Prix final :</strong> le serveur recalcule le total à partir des prix du menu, pour qu’il soit toujours exact.</li>
          </ul>
        </div>
      </div>
    </div></section>

    <div class="container callout">
      <div><h2>Prêt à passer à table ?</h2><p>Choisissez un restaurant et laissez-nous faire le reste.</p></div>
      <a routerLink="/restaurants" class="btn-tomato">J’ai faim, je commande <app-icon name="arrow-right"></app-icon></a>
    </div>
  `,
  styles: [`
    .how-hero { padding: 64px 0 8px; }
    .how-hero .eyebrow { color: var(--primary); margin-bottom: 10px; }
    .how-hero h1 { font-family: var(--font-display); font-weight: 400; font-size: 46px; line-height: 1.15; }
    .how-intro { margin-top: 14px; max-width: 560px; color: var(--muted-foreground); line-height: 1.8; }

    .timeline { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; max-width: 760px; }
    .timeline-item { display: flex; gap: 24px; padding-bottom: 34px; position: relative; }
    .timeline-item:not(:last-child)::before { content: ''; position: absolute; left: 30px; top: 66px; bottom: 4px; width: 2px; background: rgba(128,128,128,.3); }
    .timeline-item .step-icon { flex-shrink: 0; margin: 0; }
    .step-number { border-color: var(--background); }
    .timeline-body h3 { font-size: 18px; font-weight: 700; margin: 6px 0 8px; }
    .timeline-body p { color: var(--muted-foreground); line-height: 1.8; margin: 0; }
    .tag { display: inline-block; margin-top: 10px; padding: 4px 12px; border-radius: 999px; background: var(--secondary); font-size: 12px; font-weight: 600; }

    .status-row { display: grid; grid-template-columns: repeat(5, 1fr); gap: 18px; text-align: center; }
    .status { display: grid; gap: 6px; justify-items: center; }
    .status-dot { width: 38px; height: 38px; border-radius: 50%; background: var(--primary); color: var(--primary-foreground); display: grid; place-items: center; font-weight: 700; }
    .status small { color: var(--muted-foreground); line-height: 1.6; }
    .status-note { text-align: center; margin: 28px auto 0; max-width: 560px; color: var(--muted-foreground); font-size: 13px; }

    .formula { font-size: 18px; margin-bottom: 24px; }
    .price-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 32px; align-items: start; }
    .price-card, .price-info { border: 1px solid rgba(128,128,128,.3); border-radius: 18px; padding: 24px; }
    .price-card h3, .price-info h3 { margin: 0 0 16px; font-size: 17px; }
    .promo-switch { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 18px; }
    .promo-switch .btn-ghost { min-height: 38px; padding: 8px 16px; font-size: 13px; }
    .promo-switch .selected { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
    .price-line { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px dashed rgba(128,128,128,.3); }
    .price-line.discount { color: #2f9e44; font-weight: 600; }
    .price-line.total { border: 0; font-size: 1.3rem; font-weight: 800; padding-top: 16px; }
    .price-info ul { margin: 0; padding-left: 18px; display: grid; gap: 10px; line-height: 1.7; color: var(--muted-foreground); }
    .price-info strong { color: inherit; }

    @media (max-width: 800px) {
      .how-hero h1 { font-size: 34px; }
      .status-row { grid-template-columns: 1fr; text-align: left; }
      .status { grid-template-columns: 38px 1fr; justify-items: start; column-gap: 12px; }
      .status small { grid-column: 2; }
      .price-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class HowItWorks {
  steps = [
    { icon: 'search', title: 'Trouvez votre restaurant', text: 'Depuis l’accueil, tapez « pizza, couscous, burger… » dans la barre de recherche ou filtrez par type de cuisine. Ouvrez la fiche du restaurant pour voir son menu et ses frais de livraison.' },
    { icon: 'utensils', title: 'Choisissez vos plats', text: 'Ajoutez les plats qui vous font envie au panier. Vous commandez dans un seul restaurant à la fois, et votre panier est gardé même si vous rechargez la page.', tag: 'Un restaurant par commande' },
    { icon: 'shopping-bag', title: 'Vérifiez votre panier', text: 'Modifiez les quantités, supprimez un plat et appliquez un code promo si vous en avez un. Le sous-total, la remise, la livraison et le total se mettent à jour instantanément.' },
    { icon: 'map-pin', title: 'Indiquez votre adresse', text: 'Renseignez l’adresse de livraison (obligatoire) et, si besoin, une remarque comme « sans oignons ». Il faut être connecté pour valider : sinon, nous vous proposons de vous connecter ou de créer un compte.', tag: 'Paiement à la livraison' },
    { icon: 'clock3', title: 'Suivez votre commande', text: 'Après avoir cliqué sur « Commander », rendez-vous dans « Mes commandes » : le statut se met à jour automatiquement, sans recharger la page.' },
    { icon: 'bike', title: 'Recevez et payez', text: 'Le livreur arrive chez vous. Vous réglez le montant total en espèces à la réception, puis vous n’avez plus qu’à vous régaler.' }
  ];

  statuses = [
    { label: 'En attente', text: 'Votre commande est envoyée au restaurant.' },
    { label: 'Acceptée', text: 'Le restaurant confirme la commande.' },
    { label: 'En préparation', text: 'Vos plats sont en cuisine.' },
    { label: 'En livraison', text: 'Le livreur est en route.' },
    { label: 'Livrée', text: 'Bon appétit !' }
  ];

  // Exemple de calcul (mêmes règles que le panier)
  readonly unit = 12;
  readonly delivery = 3;
  promo = signal<PromoChoice>('none');
  sousTotal = computed(() => this.unit * 2);
  remise = computed(() => (this.promo() === 'RESTORA10' ? this.sousTotal() * 0.1 : 0));
  frais = computed(() => (this.promo() === 'BIENVENUE' ? 0 : this.delivery));
  total = computed(() => this.sousTotal() - this.remise() + this.frais());
}