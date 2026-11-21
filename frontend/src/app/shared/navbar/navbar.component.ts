import { Component, HostListener, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <header class="nav" [class.scrolled]="scrolled()">
      <div class="container bar">
        <a routerLink="/" aria-label="Carthage Table – accueil" (click)="open.set(false)"><app-logo [size]="38" /></a>

        <button class="burger" type="button" (click)="toggleMenu()"
                [attr.aria-expanded]="open()" aria-label="Menu">
          <span></span><span></span><span></span>
        </button>

        <nav class="links" [class.open]="open()">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" (click)="open.set(false)">Accueil</a>
          <a routerLink="/restaurants" routerLinkActive="active" (click)="open.set(false)">Restaurants</a>
          <a routerLink="/" fragment="comment" (click)="open.set(false)">Comment ça marche</a>

          @if (auth.isLoggedIn()) {
            @if (dashboardLink(); as link) {
              <a [routerLink]="link.path" routerLinkActive="active" (click)="open.set(false)">{{ link.label }}</a>
            }
            <span class="hello">Salut, {{ auth.user()?.prenom }}</span>
            <button class="btn btn-ghost small" type="button" (click)="logout()">Se déconnecter</button>
          } @else {
            <a routerLink="/login" class="btn btn-ghost small" (click)="open.set(false)">Connexion</a>
            <a routerLink="/register" class="btn btn-brown small" (click)="open.set(false)">Créer un compte</a>
          }
        </nav>
      </div>
    </header>
  `,
  styles: [`
    .nav { position: sticky; top: 0; z-index: 50; background: rgba(251,245,225,.88); backdrop-filter: blur(10px); transition: box-shadow .3s; }
    .nav.scrolled { box-shadow: 0 8px 24px -16px rgba(54,54,114,.5); }
    .bar { display: flex; align-items: center; justify-content: space-between; min-height: 72px; }
    .links { display: flex; align-items: center; gap: 1.4rem; }
    .links > a:not(.btn) { font-weight: 500; color: var(--ink); padding: .3rem 0; border-bottom: 2px solid transparent; transition: border-color .2s; }
    .links > a:not(.btn):hover, .links > a.active { border-color: var(--brown); }
    .hello { font-family: var(--font-script); font-size: 1.35rem; color: var(--brown); }
    .small { padding: .55rem 1.2rem; font-size: .88rem; }
    .burger { display: none; background: none; border: 0; padding: .5rem; cursor: pointer; }
    .burger span { display: block; width: 24px; height: 2.5px; margin: 5px 0; background: var(--indigo); border-radius: 2px; transition: transform .25s, opacity .25s; }
    @media (max-width: 860px) {
      .burger { display: block; }
      .links {
        position: absolute; inset: 72px 0 auto 0; flex-direction: column; align-items: stretch; gap: 1rem;
        padding: 1.2rem 20px 1.6rem; background: var(--cream); box-shadow: 0 20px 30px -20px rgba(54,54,114,.5);
        transform-origin: top; transform: scaleY(0); opacity: 0; pointer-events: none; transition: transform .3s var(--ease), opacity .2s;
      }
      .links.open { transform: scaleY(1); opacity: 1; pointer-events: auto; }
      .links .btn { width: 100%; }
    }
  `],
})
export class NavbarComponent {
  auth = inject(AuthService);
  open = signal(false);
  scrolled = signal(false);

  dashboardLink = computed(() => {
    switch (this.auth.role()) {
      case 'admin': return { path: '/admin-dashboard', label: 'Administration' };
      case 'restaurateur': return { path: '/restaurant-dashboard', label: 'Mon restaurant' };
      default: return null;
    }
  });

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 8); }

  toggleMenu() {
    this.open.update(v => !v);
  }

  logout() { this.open.set(false); this.auth.logout(); }
}