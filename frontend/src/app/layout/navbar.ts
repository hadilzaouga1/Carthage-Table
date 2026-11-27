// Barre de navigation (design Lovable). Liens selon le rôle, bascule sombre/clair, panier, menu mobile.
import { Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ThemeService } from '../core/theme.service';
import { ToastService } from '../core/toast.service';
import { Icon } from '../core/icon';
import { ConfirmDialog } from '../shared/confirm-dialog';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, Icon, ConfirmDialog],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <!-- Logo Restora : emblème (cloche + R) et nom -->
        <a routerLink="/" class="logo" aria-label="Restora, accueil">
          <img class="logo-mark" src="img/restora-logo.png" alt="" />
          <span class="logo-wordmark"><b>R</b>estora</span>
        </a>

        <nav class="nav-links" [class.mobile-open]="mobileOpen()" (click)="mobileOpen.set(false)" aria-label="Navigation principale">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Accueil</a>
          <a routerLink="/restaurants" routerLinkActive="active" class="nav-link">Restaurants</a>
          <!-- Mes commandes : seulement pour le client -->
          @if (auth.user()?.role === 'client') { <a routerLink="/commandes" routerLinkActive="active" class="nav-link">Mes commandes</a> }
          <!-- Favoris : seulement pour le client -->
          @if (auth.user()?.role === 'client') { <a routerLink="/favoris" routerLinkActive="active" class="nav-link">Favoris</a> }
          <!-- Restaurateur : ses commandes reçues et la gestion de SON menu -->
          @if (auth.user()?.role === 'restaurateur') { <a routerLink="/restaurateur" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-link">Mon restaurant</a> }
          @if (auth.user()?.role === 'restaurateur') { <a routerLink="/restaurateur/menu" routerLinkActive="active" class="nav-link">Mon menu</a> }
          <!-- Profil : pour tout utilisateur connecté -->
          @if (auth.user()) { <a routerLink="/profil" routerLinkActive="active" class="nav-link">Mon profil</a> }
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
            <button type="button" class="btn-ghost login-button" (click)="showLogoutDialog.set(true)"><app-icon name="user"></app-icon><span class="login-label">Déconnexion</span></button>
          } @else {
            <a routerLink="/login" class="btn-tomato login-button"><app-icon name="user"></app-icon><span class="login-label">Se connecter</span></a>
          }
          <button type="button" class="icon-button mobile-toggle" (click)="mobileOpen.set(!mobileOpen())" aria-label="Menu">
            @if (mobileOpen()) { <app-icon name="x"></app-icon> } @else { <app-icon name="menu"></app-icon> }
          </button>
        </div>
      </div>
    </header>

    <!-- Dialogue de confirmation de déconnexion -->
    <app-confirm-dialog
      [open]="showLogoutDialog()"
      title="Déconnexion"
      message="Êtes-vous sûr de vouloir vous déconnecter de votre compte Restora ?"
      confirmText="Se déconnecter"
      cancelText="Annuler"
      [danger]="true"
      iconName="log-out"
      (confirmed)="confirmLogout()"
      (cancelled)="showLogoutDialog.set(false)"
    />
  `
})
export class Navbar {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  toast = inject(ToastService);
  mobileOpen = signal(false); // menu mobile ouvert ou non
  showLogoutDialog = signal(false); // modal de confirmation déconnexion

  confirmLogout() {
    this.showLogoutDialog.set(false);
    this.auth.logout();
    this.toast.show('Vous avez été déconnecté avec succès.', 'info');
  }
}