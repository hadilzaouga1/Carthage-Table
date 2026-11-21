import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth">
      <aside class="auth-side">
        <p class="script">content de vous revoir</p>
        <h2>Votre prochain repas vous attend.</h2>
        <p>Retrouvez vos commandes et recommandez vos plats préférés en quelques secondes.</p>
        <div class="bubbles" aria-hidden="true"><span>🍕</span><span>🥘</span><span>🍰</span></div>
      </aside>

      <div class="auth-main">
        <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <h1>Connexion</h1>
          <p class="sub">Entrez vos identifiants pour accéder à votre espace.</p>

          @if (error()) { <div class="alert alert-error" role="alert">{{ error() }}</div> }

          <div class="field">
            <label for="email">Adresse email</label>
            <input id="email" class="input" type="email" formControlName="email" autocomplete="email"
                   placeholder="vous@exemple.com" [class.invalid]="show('email')">
            <p class="field-error">{{ show('email') ? 'Saisissez une adresse email valide.' : '' }}</p>
          </div>

          <div class="field">
            <label for="password">Mot de passe</label>
            <div class="input-wrap">
              <input id="password" class="input" [type]="visible() ? 'text' : 'password'" formControlName="password"
                     autocomplete="current-password" [class.invalid]="show('password')">
              <button type="button" class="eye" (click)="visible.set(!visible())">{{ visible() ? 'Masquer' : 'Afficher' }}</button>
            </div>
            <p class="field-error">{{ show('password') ? 'Le mot de passe est obligatoire.' : '' }}</p>
          </div>

          <button class="btn btn-primary btn-block" type="submit" [disabled]="loading()">
            {{ loading() ? 'Connexion…' : 'Se connecter' }}
          </button>

          <p class="switch">Nouveau sur Carthage Table ? <a routerLink="/register">Créer un compte</a></p>
        </form>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
  loading = signal(false);
  error = signal('');
  visible = signal(false);

  show(name: 'email' | 'password') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.form.getRawValue()).subscribe({
      next: (res) => this.router.navigateByUrl(this.auth.homeRoute(res.user.role)),
      error: (err: HttpErrorResponse) => {
        this.error.set(err.error?.message ?? "Le serveur est injoignable. Vérifiez que l'API est lancée.");
        this.loading.set(false);
      },
    });
  }
}
