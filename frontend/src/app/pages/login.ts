import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShell } from '../shared/auth-shell';

@Component({
  selector: 'app-login',
  imports: [FormsModule, AuthShell],
  template: `
    <app-auth-shell heading="Bon retour" sub="Connectez-vous pour commander vos plats préférés.">
      <form (ngSubmit)="submit()">
        <!-- Message d'erreur renvoyé par le backend -->
        @if (error()) { <div class="alert alert-danger mt-3">{{ error() }}</div> }

        <label class="lbl">Email</label>
        <input class="line" type="email" name="email" [(ngModel)]="email" placeholder="vous@exemple.com" required>

        <label class="lbl">Mot de passe</label>
        <input class="line" type="password" name="password" [(ngModel)]="password" placeholder="••••••••" required>

        <button class="btn-gold w-100 mt-4" [disabled]="loading()">
          {{ loading() ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </app-auth-shell>
  `
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      // Succès : chaque rôle arrive sur sa page
      next: (res) => {
        const target = { client: '/restaurants', restaurateur: '/dashboard', admin: '/admin' }[res.user.role];
        this.router.navigate([target]);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Serveur injoignable. Le backend est-il lancé ?');
        this.loading.set(false);
      }
    });
  }
}