// Cadre commun de Connexion et Inscription : photo à gauche, formulaire à droite.
// <ng-content /> = l'emplacement où chaque page place son formulaire.
import { Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <section class="shell">
      <!-- Côté gauche : photo et message d'accueil -->
      <aside class="visual">
        <!-- Si la photo est introuvable, le dégradé vert reste -->
        <img src="img/pizzeria.jpg" alt="" (error)="hide($event)" />
        <div class="shade"></div>
        <div class="quote">
          <span class="crest">CT</span>
          <h2>À la table<br />de Carthage</h2>
          <p>Des saveurs authentiques, livrées chez vous.</p>
          <ul>
            <li>Restaurants partenaires sélectionnés</li>
            <li>Suivi de commande en direct</li>
            <li>Paiement à la livraison</li>
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
    /* Deux colonnes égales ; 91px = hauteur de la navbar */
    .shell { display: grid; grid-template-columns: 1fr 1fr; min-height: calc(100vh - 91px); }

    /* Colonne gauche : fond vert sombre, photo, dégradé et texte */
    .visual { position: relative; display: flex; align-items: flex-end; overflow: hidden; background: radial-gradient(circle at 30% 30%, #1f4d36, #0b1a12 75%); }
    .visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; max-width: none; }
    .shade { position: absolute; inset: 0; background: linear-gradient(0deg, rgba(5, 15, 10, 0.95) 5%, rgba(5, 15, 10, 0.3) 70%); }
    .quote { position: relative; padding: 48px; color: #f8efe0; }  /* texte toujours clair : le fond est sombre */
    .crest { display: grid; place-items: center; width: 46px; height: 46px; border: 2px solid var(--gold); color: var(--gold); border-radius: 6px; font-family: var(--font-display); margin-bottom: 19px; }
    .quote h2 { color: var(--gold); font-family: var(--font-display); font-weight: 400; font-size: clamp(32px, 4vw, 51px); line-height: 1.1; margin-bottom: 13px; }
    .quote ul { list-style: none; padding: 0; margin: 19px 0 0; }
    .quote li { margin-bottom: 7px; opacity: 0.85; }
    .quote li::before { content: ''; display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--gold); margin-right: 10px; vertical-align: middle; }

    /* Colonne droite : le formulaire, centré */
    .panel { display: flex; align-items: center; justify-content: center; padding: 32px 24px; }
    .inner { width: 100%; max-width: 440px; }

    /* Onglets Connexion / Inscription */
    .tabs { display: inline-flex; padding: 4px; border: 1px solid var(--border); border-radius: 999px; margin-bottom: 32px; }
    .tabs a { padding: 8px 21px; border-radius: 999px; color: var(--muted-foreground); font-size: 13px; font-weight: 500; }
    .tabs a.on { background: var(--gold); color: var(--gold-foreground); }

    h1 { font-family: var(--font-display); font-weight: 400; font-size: 38px; margin-bottom: 8px; }
    .sub { color: var(--muted-foreground); margin-bottom: 28px; font-size: 13px; }

    /* Sur mobile : on cache la photo, le formulaire prend toute la largeur */
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

  // Cache la photo si elle est introuvable
  hide(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}