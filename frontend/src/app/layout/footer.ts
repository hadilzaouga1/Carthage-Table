// Pied de page (design Lovable).
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, Icon],
  template: `
    <footer class="site-footer">
      <div class="container">
        <div class="footer-main">
          <div>
            <a routerLink="/" class="logo" aria-label="Restora, accueil"><img class="logo-mark" src="img/restora-logo.png" alt="" /><span class="logo-wordmark"><b>R</b>estora</span></a>
            <p class="footer-tagline">Découvrez · Commandez · Savourez. Le meilleur de nos restaurants, livré chez vous, avec amour, en Tunisie.</p>
          </div>
          <div class="footer-links">
            <div>
              <h3>À votre table</h3>
              <a routerLink="/restaurants">Nos restaurants</a>
              <a routerLink="/commandes">Mes commandes</a>
              <a routerLink="/register">Nous rejoindre</a>
            </div>
            <div>
              <h3>Nos partenaires</h3>
              <a routerLink="/restaurateur">Espace restaurateur <app-icon name="arrow-up-right" class="inline"></app-icon></a>
              <a routerLink="/admin">Espace admin <app-icon name="arrow-up-right" class="inline"></app-icon></a>
              <a href="mailto:bonjour&#64;restora.tn">Nous contacter</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom"><span>© 2026 Restora. Tous droits réservés.</span><span>Fait avec amour en Tunisie</span></div>
      </div>
    </footer>
  `
})
export class Footer {}