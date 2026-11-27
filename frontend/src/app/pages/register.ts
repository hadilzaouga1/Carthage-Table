// Page d'inscription : crée un compte client puis connecte l'utilisateur.
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShell } from '../shared/auth-shell';
import { PasswordToggle } from '../shared/password-toggle';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, AuthShell, PasswordToggle],
  template: `
    <app-auth-shell heading="Rejoignez-nous" sub="Créez votre compte en une minute.">
      <form (ngSubmit)="submit()">
        @if (error()) { <div class="form-error" role="alert">{{ error() }}</div> }

        <!-- Nom et prénom côte à côte (une seule colonne sur mobile) -->
        <div class="form-grid">
          <div class="form-field">
            <label class="form-label" for="nom">Nom</label>
            <input id="nom" class="field" name="nom" [(ngModel)]="form.nom" autocomplete="family-name" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="prenom">Prénom</label>
            <input id="prenom" class="field" name="prenom" [(ngModel)]="form.prenom" autocomplete="given-name" required />
          </div>
        </div>

        <div class="form-field">
          <label class="form-label" for="email">Email</label>
          <input id="email" class="field" type="email" name="email" [(ngModel)]="form.email"
                 placeholder="vous@exemple.com" autocomplete="email" required />
        </div>

        <div class="form-field">
          <label class="form-label" for="telephone">Téléphone</label>
          <input id="telephone" class="field" name="telephone" [(ngModel)]="form.telephone"
                 placeholder="22123456" inputmode="numeric" maxlength="8" autocomplete="tel" required />
          <small class="form-hint">8 chiffres</small>
        </div>

        <div class="form-field">
          <label class="form-label" for="password">Mot de passe</label>
          <div class="password-wrap">
            <input id="password" class="field" [type]="showPwd() ? 'text' : 'password'" name="password" [(ngModel)]="form.password"
                   autocomplete="new-password" required />
            <app-password-toggle [visible]="showPwd()" (toggled)="showPwd.set(!showPwd())" />
          </div>
          <small class="form-hint">8 caractères minimum, avec une lettre et un chiffre</small>
        </div>

        <div class="form-field">
          <label class="form-label" for="confirmation">Confirmation du mot de passe</label>
          <div class="password-wrap">
            <input id="confirmation" class="field" [type]="showConfirm() ? 'text' : 'password'" name="confirmation" [(ngModel)]="form.confirmation"
                   autocomplete="new-password" required />
            <app-password-toggle [visible]="showConfirm()" (toggled)="showConfirm.set(!showConfirm())" />
          </div>
        </div>

        <button type="submit" class="btn-gold btn-block" [disabled]="loading()">
          {{ loading() ? 'Création…' : 'Créer mon compte' }}
        </button>
      </form>
    </app-auth-shell>
  `
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Les 6 champs exigés par le cahier des charges
  form = { nom: '', prenom: '', email: '', telephone: '', password: '', confirmation: '' };
  showPwd = signal(false);
  showConfirm = signal(false);
  error = signal('');
  loading = signal(false);

  submit() {
    this.error.set('');
    this.loading.set(true);
    this.auth.register(this.form).subscribe({
      // Après l'inscription, le client est déjà connecté
      next: () => this.router.navigate(['/restaurants']),
      error: (err) => {
        this.error.set(err.error?.message || 'Serveur injoignable. Le backend est-il lancé ?');
        this.loading.set(false);
      }
    });
  }
}