// Page de connexion : email + mot de passe, puis redirection selon le rôle.
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShell } from '../shared/auth-shell';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AuthShell],
  template: `
    <app-auth-shell heading="Bon retour" sub="Connectez-vous pour commander vos plats préférés.">
      <form (ngSubmit)="submit()">
        <!-- Message d'erreur renvoyé par le backend -->
        @if (error()) { <div class="form-error" role="alert">{{ error() }}</div> }

        <div class="form-field">
          <label class="form-label" for="email">Email</label>
          <input id="email" class="field" type="email" name="email" [(ngModel)]="email"
                 placeholder="vous@exemple.com" autocomplete="email" required />
        </div>

        <div class="form-field">
          <label class="form-label" for="password">Mot de passe</label>
          <input id="password" class="field" type="password" name="password" [(ngModel)]="password"
                 placeholder="••••••••" autocomplete="current-password" required />
        </div>

        <button type="submit" class="btn-gold btn-block" [disabled]="loading()">
          {{ loading() ? 'Connexion…' : 'Se connecter' }}
        </button>
      </form>
    </app-auth-shell>
  `
})
export class Login {
  private auth = inject(AuthService);   // service qui parle à l'API
  private router = inject(Router);      // pour changer de page

  // Valeurs saisies dans le formulaire
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
        const target = { client: '/restaurants', restaurateur: '/restaurateur', admin: '/admin' }[res.user.role];
        this.router.navigate([target]);
      },
      // Erreur : on affiche le message du serveur
      error: (err) => {
        this.error.set(err.error?.message || 'Serveur injoignable. Le backend est-il lancé ?');
        this.loading.set(false);
      }
    });
  }
}