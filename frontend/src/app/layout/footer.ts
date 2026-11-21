import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  template: `
    <footer class="foot">
      <div class="container grid">
        <div>
          <h3>Carthage Table</h3>
          <p>La livraison de repas qui met les saveurs de Tunisie à votre table.</p>
        </div>
        <div>
          <h4>Navigation</h4>
          <a routerLink="/">Accueil</a>
          <a routerLink="/restaurants">Restaurants</a>
          <a routerLink="/login">Connexion</a>
        </div>
        <div>
          <h4>Cuisines</h4>
          <span>Tunisienne</span>
          <span>Italienne</span>
          <span>Fast-food</span>
        </div>
        <div>
          <h4>Le projet</h4>
          <span>SOA / MEAN Stack</span>
          <span>ISET Bizerte</span>
          <span>Tunisie</span>
        </div>
      </div>
      <p class="copy">© 2026 Carthage Table. Tous droits réservés.</p>
    </footer>
  `,
  styles: `
    .foot { margin-top: 4rem; padding: 3rem 1rem 1.5rem; background: var(--bg-2); border-top: 1px solid var(--border); }
    .grid { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 2rem; }
    h3 { color: var(--gold); font-size: 1.5rem; }
    h4 { font-family: 'Poppins', sans-serif; font-size: 0.8rem; letter-spacing: 0.14em; text-transform: uppercase; color: var(--gold); margin-bottom: 0.8rem; }
    p, a, span { color: var(--muted); font-size: 0.92rem; }
    a, span { display: block; margin-bottom: 0.4rem; text-decoration: none; }
    a:hover { color: var(--gold); }
    .copy { text-align: center; margin: 2rem 0 0; padding-top: 1.2rem; border-top: 1px solid var(--border); font-size: 0.8rem; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr 1fr; } }
  `
})
export class Footer {}