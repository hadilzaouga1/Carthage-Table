import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

const strongPassword = (c: AbstractControl): ValidationErrors | null => {
  const v: string = c.value ?? '';
  return v.length >= 8 && /[A-Z]/.test(v) && /\d/.test(v) ? null : { weak: true };
};

const matchPasswords = (g: AbstractControl): ValidationErrors | null =>
  g.get('password')?.value === g.get('confirmation')?.value ? null : { mismatch: true };

type FieldName = 'nom' | 'prenom' | 'email' | 'telephone' | 'password' | 'confirmation';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth">
      <aside class="auth-side">
        <p class="script">bienvenue à table</p>
        <h2>Créez votre compte en une minute.</h2>
        <p>Commandez auprès de vos restaurants préférés et suivez chaque étape de la livraison.</p>
        <div class="bubbles" aria-hidden="true"><span>🥐</span><span>🍔</span><span>🥤</span></div>
      </aside>

      <div class="auth-main">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h1>Créer un compte</h1>
          <p class="sub">Tous les champs sont obligatoires.</p>

          @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }

          <div class="row-2">
            <div class="field">
              <label for="prenom">Prénom</label>
              <input id="prenom" class="input" formControlName="prenom" autocomplete="given-name" [class.invalid]="show('prenom')">
              <p class="field-error">{{ show('prenom') ? 'Obligatoire.' : '' }}</p>
            </div>
            <div class="field">
              <label for="nom">Nom</label>
              <input id="nom" class="input" formControlName="nom" autocomplete="family-name" [class.invalid]="show('nom')">
              <p class="field-error">{{ show('nom') ? 'Obligatoire.' : '' }}</p>
            </div>
          </div>

          <div class="field">
            <label for="email">Adresse email</label>
            <input id="email" class="input" type="email" formControlName="email" autocomplete="email" placeholder="vous@exemple.com" [class.invalid]="show('email')">
            <p class="field-error">{{ show('email') ? 'Saisissez une adresse email valide.' : '' }}</p>
          </div>

          <div class="field">
            <label for="telephone">Téléphone</label>
            <input id="telephone" class="input" type="tel" formControlName="telephone" autocomplete="tel" placeholder="22 123 456" [class.invalid]="show('telephone')">
            <p class="field-error">{{ show('telephone') ? 'Numéro invalide (8 à 15 chiffres).' : '' }}</p>
          </div>

          <div class="field">
            <label for="password">Mot de passe</label>
            <div class="input-wrap">
              <input id="password" class="input" [type]="visible() ? 'text' : 'password'" formControlName="password" autocomplete="new-password" [class.invalid]="show('password')">
              <button type="button" class="eye" (click)="visible.set(!visible())">{{ visible() ? 'Masquer' : 'Afficher' }}</button>
            </div>
            <div class="meter" aria-hidden="true">
              @for (i of [1, 2, 3, 4]; track i) { <i [class]="score() >= i ? 'on-' + score() : ''"></i> }
            </div>
            <ul class="rules">
              <li [class.ok]="rules().length">8 caractères minimum</li>
              <li [class.ok]="rules().upper">Une majuscule</li>
              <li [class.ok]="rules().digit">Un chiffre</li>
            </ul>
          </div>

          <div class="field">
            <label for="confirmation">Confirmer le mot de passe</label>
            <input id="confirmation" class="input" [type]="visible() ? 'text' : 'password'" formControlName="confirmation" autocomplete="new-password"
                   [class.invalid]="show('confirmation') || mismatch()">
            <p class="field-error">{{ mismatch() ? 'Les mots de passe ne correspondent pas.' : '' }}</p>
          </div>

          <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Création…' : 'Créer mon compte' }}
          </button>

          <p class="switch">Déjà inscrit ? <a routerLink="/login">Se connecter</a></p>
        </form>
      </div>
    </section>
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group(
    {
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required, Validators.pattern(/^[0-9+\s]{8,15}$/)]],
      password: ['', [Validators.required, strongPassword]],
      confirmation: ['', Validators.required],
    },
    { validators: matchPasswords }
  );

  loading = signal(false);
  error = signal('');
  visible = signal(false);

  private pwd = toSignal(this.form.controls.password.valueChanges, { initialValue: '' });
  private conf = toSignal(this.form.controls.confirmation.valueChanges, { initialValue: '' });

  rules = computed(() => {
    const v = this.pwd();
    return { length: v.length >= 8, upper: /[A-Z]/.test(v), digit: /\d/.test(v), special: /[^A-Za-z0-9]/.test(v) };
  });
  score = computed(() => {
    const r = this.rules();
    return this.pwd() ? [r.length, r.upper, r.digit, r.special].filter(Boolean).length : 0;
  });
  mismatch = computed(() => !!this.conf() && this.conf() !== this.pwd());

  show(name: FieldName) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.register(this.form.getRawValue()).subscribe({
      next: (res) => this.router.navigateByUrl(this.auth.homeRoute(res.user.role)),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? "Le serveur est injoignable. Vérifiez que l'API est lancée.");
        this.loading.set(false);
      },
    });
  }
}
