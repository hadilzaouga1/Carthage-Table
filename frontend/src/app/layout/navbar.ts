// Barre de navigation (design Lovable). Liens selon le rôle, bascule sombre/clair, panier, menu mobile.
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <!-- Logo vectoriel : reste net sur tous les écrans -->
        <a routerLink="/" class="logo" aria-label="Carthage Table, accueil">
          <svg class="logo-symbol" viewBox="0 0 40 44" fill="none" aria-hidden="true">
            <path d="M5 19L20 6l15 13M9 18v18m22-18v18M7 36h26M4 41h32M15 21v15m10-15v15M9 18h22" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
            <path d="M16 3h8" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
          </svg>
          <span class="logo-wordmark">Carthage<span>Table.</span></span>
        </a>

        <nav class="nav-links" [class.mobile-open]="mobileOpen()" (click)="mobileOpen.set(false)" aria-label="Navigation principale">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Accueil</a>
          <a routerLink="/restaurants" routerLinkActive="active" class="nav-link">Restaurants</a>
          <!-- Mes commandes : seulement pour le client -->
          @if (auth.user()?.role === 'client') { <a routerLink="/commandes" routerLinkActive="active" class="nav-link">Mes commandes</a> }
          <!-- Restaurateur : ses commandes reçues et la gestion de SON menu -->
          @if (auth.user()?.role === 'restaurateur') { <a routerLink="/restaurateur" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Mon restaurant</a> }
          @if (auth.user()?.role === 'restaurateur') { <a routerLink="/restaurateur/menu" routerLinkActive="active" class="nav-link">Mon menu</a> }
          <!-- Admin : administration seulement (il ne gère pas les menus des restaurants) -->
          @if (auth.user()?.role === 'admin') { <a routerLink="/admin" routerLinkActive="active" class="nav-link">Administration</a> }
        </nav>

        <div class="header-actions">
          <!-- Bascule mode sombre / clair -->
          <button type="button" class="icon-button" (click)="theme.toggle()" [attr.aria-label]="theme.theme() === 'dark' ? 'Mode clair' : 'Mode sombre'">
            @if (theme.theme() === 'dark') { <app-icon name="sun"></app-icon> } @else { <app-icon name="moon"></app-icon> }
          </button>
          <!-- Panier : caché pour le restaurateur et l'admin (seul un client peut commander) -->
          @if (auth.user()?.role !== 'restaurateur' && auth.user()?.role !== 'admin') {
            <a routerLink="/panier" class="icon-button cart-link" aria-label="Panier"><app-icon name="shopping-bag"></app-icon></a>
          }
          @if (auth.user()) {
            <button type="button" class="btn-ghost login-button" (click)="auth.logout()"><app-icon name="user"></app-icon><span class="login-label">Déconnexion</span></button>
          } @else {
            <a routerLink="/login" class="btn-tomato login-button"><app-icon name="user"></app-icon><span class="login-label">Se connecter</span></a>
          }
          <button type="button" class="icon-button mobile-toggle" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            @if (mobileOpen()) { <app-icon name="x"></app-icon> } @else { <app-icon name="menu"></app-icon> }
          </button>
        </div>
      </div>
    </header>
  `
})
export class Navbar {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  mobileOpen = signal(false); // menu mobile ouvert ou non
}