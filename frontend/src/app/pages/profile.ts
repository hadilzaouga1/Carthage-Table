import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../core/auth.service';
import { UserService } from '../core/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule],
  styles: [`
    .profile-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 24px; align-items: start; }
    .panel-card { background: var(--card); border: 1px solid var(--border); border-radius: 18px; padding: 28px; box-shadow: var(--shadow); }
    .panel-card h3 { font-size: 19px; margin-bottom: 20px; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-success { background: var(--success-bg); color: var(--success); border-radius: 10px; padding: 12px 16px; font-size: 12px; margin-bottom: 20px; }
    .readonly { opacity: .65; }
    .role-tag { display: inline-block; background: var(--secondary); border-radius: 999px; padding: 4px 12px; font-size: 11px; font-weight: 600; margin-bottom: 18px; }
    @media (max-width: 800px) { .profile-grid, .row { grid-template-columns: 1fr; } }
  `],
  template: `
    <section class="section"><div class="container">
      <div class="section-heading">
        <div>
          <p class="eyebrow">MON COMPTE</p>
          <h2>Mon profil<span class="text-primary">.</span></h2>
        </div>
      </div>

      <div class="profile-grid">
        <!-- Informations personnelles -->
        <form class="panel-card" (ngSubmit)="saveProfile()">
          <h3>Informations personnelles</h3>
          <span class="role-tag">{{ roleLabel() }}</span>
          @if (infoError()) { <div class="form-error" role="alert">{{ infoError() }}</div> }
          @if (infoOk()) { <div class="form-success" role="status">{{ infoOk() }}</div> }

          <div class="row">
            <div class="form-field">
              <label class="form-label" for="prenom">Prénom</label>
              <input id="prenom" class="field" name="prenom" [(ngModel)]="prenom" required />
            </div>
            <div class="form-field">
              <label class="form-label" for="nom">Nom</label>
              <input id="nom" class="field" name="nom" [(ngModel)]="nom" required />
            </div>
          </div>
          <div class="form-field">
            <label class="form-label" for="email">Email (non modifiable)</label>
            <input id="email" class="field readonly" name="email" [value]="auth.user()?.email" disabled />
          </div>
          <div class="form-field">
            <label class="form-label" for="tel">Téléphone (8 chiffres)</label>
            <input id="tel" class="field" name="telephone" [(ngModel)]="telephone" inputmode="numeric" maxlength="8" required />
          </div>
          <button type="submit" class="btn-tomato" [disabled]="infoLoading()">{{ infoLoading() ? 'Enregistrement…' : 'Enregistrer' }}</button>
        </form>

        <!-- Mot de passe -->
        <form class="panel-card" (ngSubmit)="savePassword()">
          <h3>Changer le mot de passe</h3>
          @if (pwdError()) { <div class="form-error" role="alert">{{ pwdError() }}</div> }
          @if (pwdOk()) { <div class="form-success" role="status">{{ pwdOk() }}</div> }

          <div class="form-field">
            <label class="form-label" for="old">Ancien mot de passe</label>
            <input id="old" class="field" type="password" name="old" [(ngModel)]="oldPassword" autocomplete="current-password" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="new">Nouveau mot de passe</label>
            <input id="new" class="field" type="password" name="new" [(ngModel)]="newPassword" autocomplete="new-password" required />
          </div>
          <div class="form-field">
            <label class="form-label" for="confirm">Confirmer le nouveau mot de passe</label>
            <input id="confirm" class="field" type="password" name="confirm" [(ngModel)]="confirm" autocomplete="new-password" required />
          </div>
          <small class="results-count">Au moins 8 caractères, avec une lettre et un chiffre.</small><br />
          <button type="submit" class="btn-gold" [disabled]="pwdLoading()">{{ pwdLoading() ? 'Modification…' : 'Modifier le mot de passe' }}</button>
        </form>
      </div>
    </div></section>
  `
})
export class Profile {
  auth = inject(AuthService);
  private users = inject(UserService);

  // Valeurs des formulaires (préremplies avec l'utilisateur connecté)
  prenom = this.auth.user()?.prenom ?? '';
  nom = this.auth.user()?.nom ?? '';
  telephone = this.auth.user()?.telephone ?? '';
  oldPassword = '';
  newPassword = '';
  confirm = '';

  infoError = signal(''); infoOk = signal(''); infoLoading = signal(false);
  pwdError = signal(''); pwdOk = signal(''); pwdLoading = signal(false);

  roleLabel() {
    const role = this.auth.user()?.role;
    return role === 'admin' ? 'Administrateur' : role === 'restaurateur' ? 'Restaurateur' : 'Client';
  }

  saveProfile() {
    this.infoError.set(''); this.infoOk.set('');
    if (!this.prenom.trim() || !this.nom.trim()) return this.infoError.set('Le nom et le prénom sont obligatoires.');
    if (!/^\d{8}$/.test(this.telephone)) return this.infoError.set('Le téléphone doit contenir exactement 8 chiffres.');

    this.infoLoading.set(true);
    this.users.updateProfile({ nom: this.nom.trim(), prenom: this.prenom.trim(), telephone: this.telephone }).subscribe({
      next: (res) => {
        // On met à jour l'utilisateur gardé dans le navigateur
        this.auth.updateUser({ nom: res.user.nom, prenom: res.user.prenom, telephone: res.user.telephone });
        this.infoOk.set('Profil mis à jour.');
        this.infoLoading.set(false);
      },
      error: (err) => {
        this.infoError.set(err.error?.message || 'Impossible de mettre à jour le profil.');
        this.infoLoading.set(false);
      }
    });
  }

  savePassword() {
    this.pwdError.set(''); this.pwdOk.set('');
    if (!this.oldPassword || !this.newPassword) return this.pwdError.set('Remplissez tous les champs.');
    if (this.newPassword !== this.confirm) return this.pwdError.set('Les deux nouveaux mots de passe sont différents.');

    this.pwdLoading.set(true);
    this.users.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.pwdOk.set('Mot de passe modifié.');
        this.oldPassword = this.newPassword = this.confirm = '';
        this.pwdLoading.set(false);
      },
      error: (err) => {
        this.pwdError.set(err.error?.message || 'Impossible de modifier le mot de passe.');
        this.pwdLoading.set(false);
      }
    });
  }
}