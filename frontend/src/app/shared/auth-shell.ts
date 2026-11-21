import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

// Cadre commun de Connexion et Inscription : photo à gauche, formulaire à droite.
// <ng-content /> = l'emplacement où chaque page place son formulaire.
@Component({
  selector: 'app-auth-shell',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <section class="shell">
      <!-- Côté gauche : photo et message d'accueil -->
      <aside class="visual">
        <img src="img/hero.jpg" alt="" (error)="hide($event)">
        <div class="shade"></div>
        <div class="quote">
          <span class="crest">CT</span>
          <h2>À la table<br>de Carthage</h2>
          <p>Des saveurs authentiques, livrées chez vous.</p>
          <ul>
            <li><i class="bi bi-check2-circle"></i> Restaurants partenaires sélectionnés</li>
            <li><i class="bi bi-check2-circle"></i> Suivi de commande en direct</li>
            <li><i class="bi bi-check2-circle"></i> Paiement à la livraison</li>
          </ul>
        </div>
      </aside>

      <!-- Côté droit : onglets + formulaire -->
      <div class="panel">
        <div class="inner">
          <div class="tabs">
            <a routerLink="/login" routerLinkActive="on">Connexion</a>
            <a routerLink="/register" routerLinkActive="on">Inscription</a>
          </div>
          <h1>{{ heading() }}</h1>
          <p class="sub">{{ sub() }}</p>
          <!-- Le formulaire de la page vient ici -->
          <ng-content />
        </div>
      </div>
    </section>
  `,
  styles: `
    .shell { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 66px); }

    .visual { position: relative; display: flex; align-items: flex-end; overflow: hidden; background: radial-gradient(circle at 30% 30%, #1f4d36, #0b1a12 75%); }
    .visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(5, 15, 10, 0.95) 5%, rgba(5, 15, 10, 0.3) 70%); }
    .quote { position: relative; padding: 3rem; color: var(--cream); }
    .crest { display: grid; place-items: center; width: 46px; height: 46px; border: 2px solid var(--honey); color: var(--honey); border-radius: 6px; font-family: var(--font-display); font-weight: 800; margin-bottom: 1.2rem; }
    .quote h2 { color: var(--honey); font-size: clamp(2rem, 4vw, 3.2rem); margin-bottom: 0.8rem; }
    .quote ul { list-style: none; padding: 0; margin: 1.2rem 0 0; }
    .quote li { margin-bottom: 0.4rem; opacity: 0.85; }
    .quote li i { color: var(--honey); margin-right: 0.4rem; }

    .panel { display: flex; align-items: center; justify-content: center; padding: 2rem 1.5rem; }
    .inner { width: 100%; max-width: 420px; }

    /* Onglets Connexion / Inscription */
    .tabs { display: inline-flex; padding: 4px; border: 1px solid var(--border); border-radius: 999px; margin-bottom: 2rem; }
    .tabs a { padding: 0.45rem 1.3rem; border-radius: 999px; color: var(--muted); text-decoration: none; font-size: 0.9rem; font-weight: 500; }
    .tabs a.on { background: var(--gold); color: var(--on-gold); }

    h1 { font-size: 2.4rem; }
    .sub { color: var(--muted); margin-bottom: 0.5rem; }

    @media (max-width: 900px) {
      .shell { grid-template-columns: 1fr; }
      .visual { display: none; }
    }
  `
})
export class AuthShell {
  // Textes donnés par chaque page : <app-auth-shell heading="..." sub="...">
  heading = input('');
  sub = input('');

  hide(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}