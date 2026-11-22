// Page Administration : statistiques, restaurants (créer, modifier, valider, supprimer),
// catégories de cuisine et utilisateurs (recherche, rôle, activation).
import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AdminStats, AdminRestaurant, AdminUser } from '../core/admin.service';
import { CuisineService, Cuisine } from '../core/cuisine.service';

const STATUT_LABELS: Record<string, string> = {
  en_attente: 'En attente', acceptee: 'Acceptées', en_preparation: 'En préparation',
  en_livraison: 'En livraison', livree: 'Livrées', annulee: 'Annulées'
};

@Component({
  selector: 'app-admin',
  standalone: true,
  template: `
    <section class="section"><div class="container">
      <h2>Administration<span class="text-primary">.</span></h2>
      @if (error()) { <p class="error">{{ error() }}</p> }
      @if (success()) { <p class="success">{{ success() }}</p> }

      <!-- Statistiques générales -->
      @if (stats()) {
        <div class="stats">
          <div class="stat"><small>Clients</small><strong>{{ stats()!.clients }}</strong></div>
          <div class="stat"><small>Restaurants</small><strong>{{ stats()!.restaurants }}</strong></div>
          <div class="stat"><small>À valider</small><strong>{{ stats()!.restaurantsEnAttente }}</strong></div>
          <div class="stat"><small>Commandes</small><strong>{{ stats()!.commandes }}</strong></div>
          <div class="stat"><small>Chiffre d'affaires</small><strong>{{ stats()!.chiffreAffaires.toFixed(2) }} DT</strong></div>
        </div>
        @if (statutsList().length) {
          <p class="top"><strong>Commandes par statut :</strong>
            @for (s of statutsList(); track s.label; let last = $last) { {{ s.label }} ({{ s.nombre }}){{ last ? '' : ' · ' }} }
          </p>
        }
        @if (stats()!.restaurantsPopulaires?.length) {
          <p class="top"><strong>Restaurants les plus actifs :</strong>
            @for (r of stats()!.restaurantsPopulaires!; track r.nom; let last = $last) { {{ r.nom }} ({{ r.commandes }}){{ last ? '' : ' · ' }} }
          </p>
        }
      }

      <div class="tabs">
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'restaurants'" (click)="tab.set('restaurants')">Restaurants</button>
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'cuisines'" (click)="tab.set('cuisines')">Catégories de cuisine</button>
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'users'" (click)="tab.set('users')">Utilisateurs</button>
      </div>

      <!-- ===== RESTAURANTS ===== -->
      @if (tab() === 'restaurants') {
        <button type="button" class="btn-tomato" (click)="toggleForm()">{{ showForm() ? 'Fermer le formulaire' : '+ Créer un restaurant' }}</button>

        @if (showForm()) {
          <div class="form">
            <h3>{{ editingId() ? 'Modifier le restaurant' : 'Nouveau restaurant (validé tout de suite)' }}</h3>
            <input placeholder="Nom du restaurant *" [value]="nom()" (input)="nom.set($any($event.target).value)" />
            <input placeholder="Adresse *" [value]="adresse()" (input)="adresse.set($any($event.target).value)" />
            <select (change)="cuisine.set($any($event.target).value)">
              <option value="">Type de cuisine *</option>
              @for (c of cuisineService.cuisines(); track c._id) { <option [value]="c.nom" [selected]="c.nom === cuisine()">{{ c.icon }} {{ c.nom }}</option> }
            </select>
            <input placeholder="Frais de livraison en DT (ex : 5, vide = gratuit)" [value]="frais()" (input)="frais.set($any($event.target).value)" />
            <input placeholder="Horaires (ex : 10:00 - 23:00)" [value]="horaires()" (input)="horaires.set($any($event.target).value)" />
            <input placeholder="Description" [value]="description()" (input)="description.set($any($event.target).value)" />
            @if (!editingId()) {
              <select (change)="owner.set($any($event.target).value)">
                <option value="">Propriétaire (restaurateur) *</option>
                @for (u of restaurateurs(); track uid(u)) { <option [value]="uid(u)" [selected]="uid(u) === owner()">{{ u.prenom }} {{ u.nom }} · {{ u.email }}</option> }
              </select>
              @if (!restaurateurs().length) { <small>Aucun restaurateur : changez d'abord le rôle d'un utilisateur dans l'onglet Utilisateurs.</small> }
            }
            <div class="row">
              <button type="button" class="btn-tomato" (click)="saveRestaurant()">{{ editingId() ? 'Enregistrer' : 'Créer le restaurant' }}</button>
              @if (editingId()) { <button type="button" class="btn-ghost" (click)="resetForm()">Annuler</button> }
            </div>
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
            <button type="button" class="btn-ghost" (click)="editRestaurant(r)">Modifier</button>
            <button type="button" class="btn-ghost" (click)="removeRestaurant(r)">Supprimer</button>
          </div>
        }
        @if (!restaurants().length) { <p>Aucun restaurant pour ce filtre.</p> }
      }

      <!-- ===== CATÉGORIES DE CUISINE ===== -->
      @if (tab() === 'cuisines') {
        <div class="form">
          <h3>{{ cuisineEditId() ? 'Modifier la catégorie' : 'Ajouter une catégorie de cuisine' }}</h3>
          <input placeholder="Nom * (ex : Libanais)" [value]="cNom()" (input)="cNom.set($any($event.target).value)" />
          <input placeholder="Emoji (ex : 🥙)" [value]="cIcon()" (input)="cIcon.set($any($event.target).value)" />
          <input placeholder="Description" [value]="cDesc()" (input)="cDesc.set($any($event.target).value)" />
          <div class="row">
            <button type="button" class="btn-tomato" (click)="saveCuisine()">{{ cuisineEditId() ? 'Enregistrer' : 'Ajouter' }}</button>
            @if (cuisineEditId()) { <button type="button" class="btn-ghost" (click)="resetCuisine()">Annuler</button> }
          </div>
        </div>
        @for (c of cuisineService.cuisines(); track c._id) {
          <div class="item">
            <span class="ico">{{ c.icon || '🍽️' }}</span>
            <div class="info"><strong>{{ c.nom }}</strong><small>{{ c.description }}</small></div>
            <button type="button" class="btn-ghost" (click)="editCuisine(c)">Modifier</button>
            <button type="button" class="btn-ghost" (click)="removeCuisine(c)">Supprimer</button>
          </div>
        }
      }

      <!-- ===== UTILISATEURS ===== -->
      @if (tab() === 'users') {
        <div class="row">
          <input class="search" type="search" placeholder="Rechercher un utilisateur (nom, prénom, email)" [value]="search()" (input)="onSearch($any($event.target).value)" />
          <select (change)="setRoleFilter($any($event.target).value)">
            <option value="">Tous les rôles</option>
            @for (r of roles; track r) { <option [value]="r" [selected]="roleFilter() === r">{{ r }}</option> }
          </select>
        </div>
        <small>{{ usersTotal() }} utilisateur(s)</small>
        @for (u of users(); track uid(u)) {
          <div class="item">
            <div class="info"><strong>{{ u.prenom }} {{ u.nom }}</strong><small>{{ u.email }}{{ u.isActive === false ? ' · compte désactivé' : '' }}</small></div>
            <select (change)="setRole(u, $any($event.target).value)">
              @for (r of roles; track r) { <option [value]="r" [selected]="u.role === r">{{ r }}</option> }
            </select>
            <button type="button" class="btn-ghost" (click)="toggleActive(u)">{{ u.isActive === false ? 'Réactiver' : 'Désactiver' }}</button>
          </div>
        }
        @if (!users().length) { <p>Aucun utilisateur trouvé.</p> }
        @if (usersPages() > 1) {
          <div class="pager">
            <button type="button" class="btn-ghost" [disabled]="usersPage() <= 1" (click)="goToUsersPage(usersPage() - 1)">Précédent</button>
            <span>Page {{ usersPage() }} / {{ usersPages() }}</span>
            <button type="button" class="btn-ghost" [disabled]="usersPage() >= usersPages()" (click)="goToUsersPage(usersPage() + 1)">Suivant</button>
          </div>
        }
      }
    </div></section>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat { padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 4px; }
    .stat strong { font-size: 1.4rem; }
    .top { margin: 6px 0; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 8px 0; }
    .form { display: grid; gap: 10px; max-width: 520px; margin: 16px 0; }
    .form h3 { margin: 0; }
    input { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .search { flex: 1; min-width: 220px; }
    .item { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; margin: 8px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .info { flex: 1; min-width: 160px; display: grid; }
    .ico { font-size: 1.8rem; }
    .badge { padding: 4px 12px; border-radius: 999px; font-size: .85rem; font-weight: 700; border: 1px solid rgba(128,128,128,.4); }
    .badge[data-s="en_attente"] { background: #f5a623; color: #000; }
    .badge[data-s="valide"] { background: #2e9e5b; color: #fff; }
    .badge[data-s="suspendu"] { background: #e5484d; color: #fff; }
    select { padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .pager { display: flex; align-items: center; justify-content: center; gap: 18px; margin-top: 20px; }
    .error { color: #e5484d; font-weight: 600; }
    .success { color: #2e9e5b; font-weight: 600; }
  `]
})
export class Admin implements OnInit {
  private api = inject(AdminService);
  cuisineService = inject(CuisineService);

  stats = signal<AdminStats | null>(null);
  restaurants = signal<AdminRestaurant[]>([]);
  restaurateurs = signal<AdminUser[]>([]);
  tab = signal<'restaurants' | 'cuisines' | 'users'>('restaurants');
  filter = signal('');
  error = signal('');
  success = signal('');

  // Formulaire restaurant (création ou modification)
  showForm = signal(false);
  editingId = signal('');
  nom = signal(''); adresse = signal(''); cuisine = signal(''); frais = signal('');
  horaires = signal(''); description = signal(''); owner = signal('');

  // Formulaire catégorie de cuisine
  cuisineEditId = signal('');
  cNom = signal(''); cIcon = signal(''); cDesc = signal('');

  // Utilisateurs : recherche + pagination
  users = signal<AdminUser[]>([]);
  search = signal('');
  roleFilter = signal('');
  usersPage = signal(1);
  usersPages = signal(1);
  usersTotal = signal(0);
  private searchTimer: any;

  roles = ['client', 'restaurateur', 'admin'];
  filters = [
    { value: '', label: 'Tous' }, { value: 'en_attente', label: 'À valider' },
    { value: 'valide', label: 'Validés' }, { value: 'suspendu', label: 'Suspendus' }
  ];

  private fail = (err: any) => { this.success.set(''); this.error.set(err.error?.message || 'Une erreur est survenue.'); };
  private reset() { this.error.set(''); this.success.set(''); }

  ngOnInit() {
    this.cuisineService.load().subscribe({ error: () => {} });
    this.loadAll();
  }

  uid(u: AdminUser) { return u._id || u.id || u.email; }

  // Commandes par statut, dans l'ordre du cycle de vie
  statutsList() {
    const data = this.stats()?.commandesParStatut ?? {};
    return Object.keys(STATUT_LABELS).filter((k) => data[k]).map((k) => ({ label: STATUT_LABELS[k], nombre: data[k] }));
  }

  private loadAll() {
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: this.fail });
    this.api.restaurants(this.filter() || undefined).subscribe({ next: (r) => this.restaurants.set(r), error: this.fail });
    this.api.restaurateurs().subscribe({ next: (u) => this.restaurateurs.set(u), error: this.fail });
    this.loadUsers();
  }

  // ---------- Restaurants ----------
  setFilter(v: string) { this.filter.set(v); this.loadAll(); }

  toggleForm() {
    if (this.showForm()) this.resetForm();
    else this.showForm.set(true);
  }

  resetForm() {
    this.showForm.set(false); this.editingId.set('');
    this.nom.set(''); this.adresse.set(''); this.cuisine.set(''); this.frais.set('');
    this.horaires.set(''); this.description.set(''); this.owner.set('');
  }

  // Remplit le formulaire avec le restaurant à modifier
  editRestaurant(r: AdminRestaurant) {
    this.editingId.set(r._id); this.showForm.set(true);
    this.nom.set(r.nom); this.adresse.set(r.adresse); this.cuisine.set(r.typeCuisine);
    this.frais.set(String(r.fraisLivraison ?? 0)); this.horaires.set(r.horaires ?? ''); this.description.set(r.description ?? '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Créer (l'admin choisit le propriétaire, restaurant validé d'office) ou modifier
  saveRestaurant() {
    this.reset();
    const editing = !!this.editingId();
    if (!this.nom().trim() || !this.adresse().trim() || !this.cuisine() || (!editing && !this.owner())) {
      this.error.set(editing ? 'Nom, adresse et cuisine sont obligatoires.' : 'Nom, adresse, cuisine et propriétaire sont obligatoires.');
      return;
    }
    const data = {
      nom: this.nom().trim(), adresse: this.adresse().trim(), typeCuisine: this.cuisine(),
      fraisLivraison: Number(this.frais().replace(',', '.')) || 0, // champ vide = livraison gratuite
      horaires: this.horaires().trim() || undefined, description: this.description().trim()
    };
    const request = editing
      ? this.api.updateRestaurant(this.editingId(), data)
      : this.api.createRestaurant({ ...data, owner: this.owner() });
    request.subscribe({
      next: () => { this.success.set(editing ? 'Restaurant modifié.' : 'Restaurant créé et validé.'); this.resetForm(); this.loadAll(); },
      error: this.fail
    });
  }

  setStatus(r: AdminRestaurant, status: string) {
    this.reset();
    this.api.setRestaurantStatus(r._id, status).subscribe({ next: () => this.loadAll(), error: this.fail });
  }

  removeRestaurant(r: AdminRestaurant) {
    if (!confirm(`Supprimer « ${r.nom} » avec ses catégories et ses plats ?`)) return;
    this.reset();
    this.api.deleteRestaurant(r._id).subscribe({
      next: () => { this.success.set('Restaurant supprimé.'); this.loadAll(); },
      error: this.fail
    });
  }

  // ---------- Catégories de cuisine ----------
  resetCuisine() { this.cuisineEditId.set(''); this.cNom.set(''); this.cIcon.set(''); this.cDesc.set(''); }

  editCuisine(c: Cuisine) {
    this.cuisineEditId.set(c._id); this.cNom.set(c.nom); this.cIcon.set(c.icon ?? ''); this.cDesc.set(c.description ?? '');
  }

  saveCuisine() {
    this.reset();
    if (!this.cNom().trim()) { this.error.set('Le nom de la catégorie est obligatoire.'); return; }
    const data = { nom: this.cNom().trim(), icon: this.cIcon().trim() || '🍽️', description: this.cDesc().trim() };
    const editing = this.cuisineEditId();
    const request = editing ? this.cuisineService.update(editing, data) : this.cuisineService.create(data);
    request.subscribe({
      next: () => {
        this.success.set(editing ? 'Catégorie modifiée.' : 'Catégorie ajoutée.');
        this.resetCuisine();
        this.cuisineService.load().subscribe();
        this.loadAll(); // les restaurants peuvent avoir été renommés
      },
      error: this.fail
    });
  }

  removeCuisine(c: Cuisine) {
    if (!confirm(`Supprimer la catégorie « ${c.nom} » ?`)) return;
    this.reset();
    // Le serveur refuse si des restaurants utilisent encore cette cuisine
    this.cuisineService.remove(c._id).subscribe({
      next: () => { this.success.set('Catégorie supprimée.'); this.cuisineService.load().subscribe(); },
      error: this.fail
    });
  }

  // ---------- Utilisateurs ----------
  private loadUsers() {
    this.api.users({ search: this.search() || undefined, role: this.roleFilter() || undefined, page: this.usersPage() }).subscribe({
      next: (p) => { this.users.set(p.users); this.usersTotal.set(p.total); this.usersPages.set(p.pages || 1); },
      error: this.fail
    });
  }

  // Recherche avec un petit délai pour ne pas appeler l'API à chaque lettre
  onSearch(text: string) {
    this.search.set(text.trim());
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => { this.usersPage.set(1); this.loadUsers(); }, 300);
  }
  setRoleFilter(role: string) { this.roleFilter.set(role); this.usersPage.set(1); this.loadUsers(); }
  goToUsersPage(p: number) { this.usersPage.set(p); this.loadUsers(); }

  setRole(u: AdminUser, role: string) {
    this.reset();
    this.api.setRole(this.uid(u)!, role).subscribe({ next: () => this.loadAll(), error: (e) => { this.fail(e); this.loadAll(); } });
  }

  toggleActive(u: AdminUser) {
    this.reset();
    this.api.setActive(this.uid(u)!, u.isActive === false).subscribe({ next: () => this.loadUsers(), error: this.fail });
  }
}
