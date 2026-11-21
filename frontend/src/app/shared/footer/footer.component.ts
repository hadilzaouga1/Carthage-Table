import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, LogoComponent],
  template: `
    <footer class="foot">
      <div class="container grid">
        <div>
          <app-logo [size]="36" [light]="true" />
          <p class="tag">Saha ! Le mot qu'on dit avant de manger, en Tunisie.</p>
        </div>
        <div>
          <h4>Explorer</h4>
          <a routerLink="/restaurants">Restaurants</a>
          <a routerLink="/" fragment="comment">Comment ça marche</a>
        </div>
        <div>
          <h4>Mon compte</h4>
          <a routerLink="/login">Connexion</a>
          <a routerLink="/register">Créer un compte</a>
        </div>
      </div>
      <p class="copy">© 2026 Carthage Table – Projet MEAN Stack</p>
    </footer>
  `,
  styles: [`
    .foot { background: var(--indigo-dark); color: #dcdbf0; padding: 3rem 0 1.2rem; margin-top: 4rem; border-radius: var(--r-lg) var(--r-lg) 0 0; }
    .grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 2rem; }
    h4 { font: 700 1rem var(--font-display); color: #fff; margin: 0 0 .8rem; }
    a { display: block; color: #dcdbf0; margin-bottom: .4rem; }
    a:hover { color: #fff; text-decoration: underline; }
    .tag { margin-top: 1rem; max-width: 30ch; font-family: var(--font-script); font-size: 1.35rem; color: #f0d9b5; line-height: 1.2; }
    .copy { text-align: center; font-size: .85rem; opacity: .7; margin: 2rem 0 0; }
    @media (max-width: 700px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class FooterComponent {}
