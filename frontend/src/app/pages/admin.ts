// Page Administration : statistiques, création et validation des restaurants, gestion des utilisateurs.
import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AdminStats, AdminRestaurant, AdminUser } from '../core/admin.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    <section class="section"><div class="container">
      <h2>Administration<span class="text-primary">.</span></h2>
      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (success()) { <p class="success">{{ success() }}</p> }

      <!-- Statistiques -->
      @if (stats()) {
        <div class="stats">
          <div class="stat"><small>Clients</small><strong>{{ stats()!.clients }}</strong></div>
          <div class="stat"><small>Restaurants</small><strong>{{ stats()!.restaurants }}</strong></div>
          <div class="stat"><small>À valider</small><strong>{{ stats()!.restaurantsEnAttente }}</strong></div>
          <div class="stat"><small>Commandes</small><strong>{{ stats()!.commandes }}</strong></div>
          <div class="stat"><small>Chiffre d'affaires</small><strong>{{ stats()!.chiffreAffaires.toFixed(2) }} DT</strong></div>
        </div>
      }

      <div class="tabs">
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'restaurants'" (click)="tab.set('restaurants')">Restaurants</button>
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'users'" (click)="tab.set('users')">Utilisateurs</button>
      </div>

      @if (tab() === 'restaurants') {
        <!-- Création d'un restaurant par l'admin : il est validé tout de suite -->
        <button type="button" class="btn-tomato" (click)="showForm.set(!showForm())">{{ showForm() ? 'Fermer le formulaire' : '+ Créer un restaurant' }}</button>

        @if (showForm()) {
          <div class="form">
            <input placeholder="Nom du restaurant *" [value]="nom()" (input)="nom.set($any($event.target).value)" />
            <input placeholder="Adresse *" [value]="adresse()" (input)="adresse.set($any($event.target).value)" />
            <input placeholder="Type de cuisine * (ex : Tunisien, Pizza)" [value]="cuisine()" (input)="cuisine.set($any($event.target).value)" />
            <input placeholder="Frais de livraison en DT (ex : 5, vide = gratuit)" [value]="frais()" (input)="frais.set($any($event.target).value)" />
            <select (change)="owner.set($any($event.target).value)">
              <option value="">Propriétaire (restaurateur) *</option>
              @for (u of restaurateurs(); track uid(u)) { <option [value]="uid(u)" [selected]="uid(u) === owner()">{{ u.prenom }} {{ u.nom }} · {{ u.email }}</option> }
            </select>
            @if (!restaurateurs().length) { <small>Aucun restaurateur : change d'abord le rôle d'un utilisateur dans l'onglet Utilisateurs.</small> }
            <button type="button" class="btn-tomato" (click)="create()">Créer le restaurant</button>
          </div>
        }

        <div class="tabs">
          @for (f of filters; track f.value) {
            <button type="button" class="btn-ghost" [class.selected]="filter() === f.value" (click)="setFilter(f.value)">{{ f.label }}</button>
          }
        </div>
        @for (r of restaurants(); track r._id) {
          <div class="item">
            <div class="info"><strong>{{ r.nom }}</strong><small>{{ r.typeCuisine }} · {{ r.adresse }}</small></div>
            <span class="badge" [attr.data-s]="r.status">{{ r.status }}</span>
            @if (r.status !== 'valide') { <button type="button" class="btn-tomato" (click)="setStatus(r, 'valide')">Valider</button> }
            @if (r.status !== 'suspendu') { <button type="button" class="btn-ghost" (click)="setStatus(r, 'suspendu')">Suspendre</button> }
          </div>
        }
        @if (!restaurants().length) { <p>Aucun restaurant pour ce filtre.</p> }
      } @else {
        @for (u of users(); track uid(u)) {
          <div class="item">
            <div class="info"><strong>{{ u.prenom }} {{ u.nom }}</strong><small>{{ u.email }}</small></div>
            <select (change)="setRole(u, $any($event.target).value)">
              @for (r of roles; track r) { <option [value]="r" [selected]="u.role === r">{{ r }}</option> }
            </select>
            <button type="button" class="btn-ghost" (click)="toggleActive(u)">{{ u.isActive === false ? 'Réactiver' : 'Désactiver' }}</button>
          </div>
        }
        @if (!users().length) { <p>Aucun utilisateur.</p> }
      }
    </div></section>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat { padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 4px; }
    .stat strong { font-size: 1.4rem; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .form { display: grid; gap: 10px; max-width: 520px; margin: 16px 0; }
    input { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .item { display: flex; align-items: center; gap: 12px; padding: 12px 16px; margin: 8px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .info { flex: 1; display: grid; }
    .badge { padding: 4px 12px; border-radius: 999px; font-size: .85rem; font-weight: 700; border: 1px solid rgba(128,128,128,.4); }
    .badge[data-s="en_attente"] { background: #f5a623; color: #000; }
    .badge[data-s="valide"] { background: #2e9e5b; color: #fff; }
    .badge[data-s="suspendu"] { background: #e5484d; color: #fff; }
    select { padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .error { color: #e5484d; font-weight: 600; }
    .success { color: #2e9e5b; font-weight: 600; }
  `]
})
export class Admin implements OnInit {
  private api = inject(AdminService);

  stats = signal<AdminStats | null>(null);
  restaurants = signal<AdminRestaurant[]>([]);
  users = signal<AdminUser[]>([]);
  tab = signal<'restaurants' | 'users'>('restaurants');
  filter = signal('');
  error = signal('');
  success = signal('');

  // Formulaire de création de restaurant
  showForm = signal(false);
  nom = signal(''); adresse = signal(''); cuisine = signal(''); frais = signal(''); owner = signal('');

  roles = ['client', 'restaurateur', 'admin'];
  filters = [
    { value: '', label: 'Tous' }, { value: 'en_attente', label: 'À valider' },
    { value: 'valide', label: 'Validés' }, { value: 'suspendu', label: 'Suspendus' }
  ];

  private fail = (err: any) => { this.success.set(''); this.error.set(err.error?.message || 'Une erreur est survenue.'); };

  ngOnInit() { this.loadAll(); }

  uid(u: AdminUser) { return u._id || u.id || u.email; }

  // Seuls les restaurateurs peuvent être propriétaires d'un restaurant
  restaurateurs() { return this.users().filter((u) => u.role === 'restaurateur'); }

  private loadAll() {
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: this.fail });
    this.api.restaurants(this.filter() || undefined).subscribe({ next: (r) => this.restaurants.set(r), error: this.fail });
    this.api.users().subscribe({ next: (u) => this.users.set(u), error: this.fail });
  }

  setFilter(v: string) { this.filter.set(v); this.loadAll(); }

  // Créer un restaurant : l'admin choisit le propriétaire, le restaurant est validé d'office
  create() {
    this.error.set(''); this.success.set('');
    if (!this.nom().trim() || !this.adresse().trim() || !this.cuisine().trim() || !this.owner()) {
      this.error.set('Nom, adresse, cuisine et propriétaire sont obligatoires.');
      return;
    }
    this.api.createRestaurant({
      nom: this.nom().trim(), adresse: this.adresse().trim(), typeCuisine: this.cuisine().trim(),
      fraisLivraison: Number(this.frais().replace(',', '.')) || 0, // champ vide = livraison gratuite
      owner: this.owner()
    }).subscribe({
      next: () => {
        this.success.set('Restaurant créé et validé.');
        this.nom.set(''); this.adresse.set(''); this.cuisine.set(''); this.frais.set(''); this.owner.set('');
        this.showForm.set(false);
        this.loadAll();
      },
      error: this.fail
    });
  }

  // Valider ou suspendre un restaurant
  setStatus(r: AdminRestaurant, status: string) {
    this.error.set(''); this.success.set('');
    this.api.setRestaurantStatus(r._id, status).subscribe({ next: () => this.loadAll(), error: this.fail });
  }

  setRole(u: AdminUser, role: string) {
    this.error.set(''); this.success.set('');
    this.api.setRole(this.uid(u)!, role).subscribe({ next: () => this.loadAll(), error: (e) => { this.fail(e); this.loadAll(); } });
  }

  toggleActive(u: AdminUser) {
    this.error.set(''); this.success.set('');
    this.api.setActive(this.uid(u)!, u.isActive === false).subscribe({ next: () => this.loadAll(), error: this.fail });
  }
}