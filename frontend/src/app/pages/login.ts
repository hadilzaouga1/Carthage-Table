// Page de connexion : email + mot de passe, puis redirection selon le rôle.
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { AuthShell } from '../shared/auth-shell';
import { PasswordToggle } from '../shared/password-toggle';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, AuthShell, PasswordToggle],
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
          <div class="password-wrap">
            <input id="password" class="field" [type]="showPwd() ? 'text' : 'password'" name="password" [(ngModel)]="password"
                   placeholder="••••••••" autocomplete="current-password" required />
            <app-password-toggle [visible]="showPwd()" (toggled)="showPwd.set(!showPwd())" />
          </div>
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
  private toast = inject(ToastService);

  // Valeurs saisies dans le formulaire
  email = '';
  password = '';
  showPwd = signal(false);
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email, this.password).subscribe({
      // Succès : affiche un toast puis redirige selon le rôle
      next: (res) => {
        const target = { client: '/restaurants', restaurateur: '/restaurateur', admin: '/admin' }[res.user.role];
        this.toast.show(`Bienvenue ${res.user.prenom || res.user.nom} ! Connexion réussie.`);
        setTimeout(() => this.router.navigate([target]), 850);
      },
      // Erreur : on affiche le message du serveur
      error: (err) => {
        this.error.set(err.error?.message || 'Serveur injoignable. Le backend est-il lancé ?');
        this.loading.set(false);
      }
    });
  }
}