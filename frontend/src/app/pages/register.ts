import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { AuthShell } from '../shared/auth-shell';

@Component({
  selector: 'app-register',
  imports: [FormsModule, AuthShell],
  template: `
    <app-auth-shell heading="Rejoignez-nous" sub="Créez votre compte en une minute.">
      <form (ngSubmit)="submit()">
        @if (error()) { <div class="alert alert-danger mt-3">{{ error() }}</div> }

        <div class="row">
          <div class="col-6">
            <label class="lbl">Nom</label>
            <input class="line" name="nom" [(ngModel)]="form.nom" required>
          </div>
          <div class="col-6">
            <label class="lbl">Prénom</label>
            <input class="line" name="prenom" [(ngModel)]="form.prenom" required>
          </div>
        </div>

        <label class="lbl">Email</label>
        <input class="line" type="email" name="email" [(ngModel)]="form.email" placeholder="vous@exemple.com" required>

        <label class="lbl">Téléphone (8 chiffres)</label>
        <input class="line" name="telephone" [(ngModel)]="form.telephone" placeholder="22123456" required>

        <label class="lbl">Mot de passe (8 caractères, une lettre, un chiffre)</label>
        <input class="line" type="password" name="password" [(ngModel)]="form.password" required>

        <label class="lbl">Confirmation</label>
        <input class="line" type="password" name="confirmation" [(ngModel)]="form.confirmation" required>

        <button class="btn-gold w-100 mt-4" [disabled]="loading()">
          {{ loading() ? 'Création...' : 'Créer mon compte' }}
        </button>
      </form>
    </app-auth-shell>
  `
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = { nom: '', prenom: '', email: '', telephone: '', password: '', confirmation: '' };
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