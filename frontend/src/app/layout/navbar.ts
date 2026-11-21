import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a routerLink="/" class="brand">
        <!-- Petit blason doré -->
        <span class="crest">CT</span>
        <span>Carthage Table</span>
      </a>

      <nav class="links">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">Accueil</a>
        <a routerLink="/restaurants" routerLinkActive="active">Restaurants</a>
        @if (auth.role() === 'client') {
          <a routerLink="/mes-commandes" routerLinkActive="active">Mes commandes</a>
          <a routerLink="/panier" routerLinkActive="active"><i class="bi bi-bag"></i> Panier</a>
        }
        @if (auth.role() === 'restaurateur') {
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        }
        @if (auth.role() === 'admin') {
          <a routerLink="/admin" routerLinkActive="active">Administration</a>
        }
      </nav>

      <div class="actions">
        <button class="theme" (click)="themeService.toggle()" title="Changer de thème">
          <i [class]="themeService.theme() === 'dark' ? 'bi bi-sun' : 'bi bi-moon-stars'"></i>
        </button>
        @if (auth.isLoggedIn()) {
          <span class="hello">Bonjour {{ auth.user()?.prenom }}</span>
          <button class="btn-ghost small" (click)="auth.logout()">Déconnexion</button>
        } @else {
          <a routerLink="/login" class="btn-ghost small">Connexion</a>
          <a routerLink="/register" class="btn-gold small">Inscription</a>
        }
      </div>
    </header>
  `,
  styles: `
    .topbar {
      position: sticky; top: 0; z-index: 50;
      display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
      padding: 0.7rem 2rem;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }
    .brand { display: flex; align-items: center; gap: 0.7rem; font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--text); text-decoration: none; }
    .crest { display: grid; place-items: center; width: 40px; height: 40px; border: 2px solid var(--gold); color: var(--gold); font-size: 0.95rem; font-weight: 800; border-radius: 6px; }
    .links { display: flex; gap: 1.6rem; }
    .links a { color: var(--muted); text-decoration: none; font-size: 0.92rem; font-weight: 500; transition: color 0.2s; }
    .links a:hover, .links a.active { color: var(--gold); }
    .actions { display: flex; align-items: center; gap: 0.6rem; }
    .hello { color: var(--muted); font-size: 0.9rem; }
    .small { padding: 0.4rem 1.1rem; font-size: 0.88rem; }
    .theme { display: grid; place-items: center; width: 38px; height: 38px; border-radius: 50%; cursor: pointer; border: 1.5px solid var(--border); background: transparent; color: var(--text); }  `
})
export class Navbar {
  auth = inject(AuthService);
  themeService = inject(ThemeService);
}