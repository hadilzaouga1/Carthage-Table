// Page Administration : statistiques, restaurants (créer, modifier, supprimer, valider), cuisines, utilisateurs.
import { Component, inject, signal, OnInit } from '@angular/core';
import { AdminService, AdminStats, AdminRestaurant, AdminUser } from '../core/admin.service';
import { CuisineService, Cuisine } from '../core/cuisine.service';

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
      }

      <div class="tabs">
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'restaurants'" (click)="tab.set('restaurants')">Restaurants</button>
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'cuisines'" (click)="tab.set('cuisines')">Cuisines</button>
        <button type="button" class="btn-ghost" [class.selected]="tab() === 'users'" (click)="tab.set('users')">Utilisateurs</button>
      </div>

      <!-- ===================== RESTAURANTS ===================== -->
      @if (tab() === 'restaurants') {
        <!-- Création d'un restaurant par l'admin : il est validé tout de suite -->
        <button type="button" class="btn-tomato" (click)="showForm.set(!showForm())">{{ showForm() ? 'Fermer le formulaire' : '+ Créer un restaurant' }}</button>

        @if (showForm()) {
          <div class="form">
            <input placeholder="Nom du restaurant *" [value]="nom()" (input)="nom.set($any($event.target).value)" />
            <input placeholder="Adresse *" [value]="adresse()" (input)="adresse.set($any($event.target).value)" />
            <select (change)="cuisine.set($any($event.target).value)">
              <option value="">Type de cuisine *</option>
              @for (c of cuisineNames(); track c) { <option [value]="c" [selected]="c === cuisine()">{{ c }}</option> }
            </select>
            <input placeholder="Frais de livraison en DT (ex : 5, vide = gratuit)" [value]="frais()" (input)="frais.set($any($event.target).value)" />
            <select (change)="owner.set($any($event.target).value)">
              <option value="">Propriétaire (restaurateur) *</option>
              @for (u of restaurateurs(); track uid(u)) { <option [value]="uid(u)" [selected]="uid(u) === owner()">{{ u.prenom }} {{ u.nom }} · {{ u.email }}</option> }
            </select>
            @if (!restaurateurs().length) { <small>Aucun restaurateur : changez d'abord le rôle d'un utilisateur dans l'onglet Utilisateurs.</small> }
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
            <span class="badge" [attr.data-s]="r.status">{{ statusLabel(r.status) }}</span>
            @if (r.status !== 'valide') { <button type="button" class="btn-tomato" (click)="setStatus(r, 'valide')">Valider</button> }
            @if (r.status !== 'suspendu') { <button type="button" class="btn-ghost" (click)="setStatus(r, 'suspendu')">Suspendre</button> }
            <button type="button" class="btn-ghost" (click)="startEdit(r)">Modifier</button>
            <button type="button" class="btn-ghost" (click)="removeRestaurant(r)">Supprimer</button>
          </div>

          <!-- Formulaire de modification (s'ouvre sous le restaurant choisi) -->
          @if (editId() === r._id) {
            <div class="form edit">
              <input placeholder="Nom *" [value]="eNom()" (input)="eNom.set($any($event.target).value)" />
              <input placeholder="Description" [value]="eDescription()" (input)="eDescription.set($any($event.target).value)" />
              <input placeholder="Adresse *" [value]="eAdresse()" (input)="eAdresse.set($any($event.target).value)" />
              <select (change)="eCuisine.set($any($event.target).value)">
                @for (c of editCuisines(); track c) { <option [value]="c" [selected]="c === eCuisine()">{{ c }}</option> }
              </select>
              <input placeholder="Horaires (ex : 10:00 - 23:00)" [value]="eHoraires()" (input)="eHoraires.set($any($event.target).value)" />
              <input placeholder="Frais de livraison en DT" [value]="eFrais()" (input)="eFrais.set($any($event.target).value)" />
              <input placeholder="Photo (nom de fichier dans public/img ou lien https)" [value]="eImage()" (input)="eImage.set($any($event.target).value)" />
              <div class="row">
                <button type="button" class="btn-tomato" (click)="saveRestaurant(r)">Enregistrer</button>
                <button type="button" class="btn-ghost" (click)="editId.set('')">Annuler</button>
              </div>
            </div>
          }
        }
        @if (!restaurants().length) { <p>Aucun restaurant pour ce filtre.</p> }
      }

      <!-- ===================== CUISINES ===================== -->
      @if (tab() === 'cuisines') {
        <p class="hint">Les cuisines proposées aux clients (filtres de l'accueil) et aux restaurateurs (création de restaurant).</p>

        <div class="form">
          <h3>{{ editingCuisine() ? 'Modifier la cuisine' : 'Ajouter une cuisine' }}</h3>
          <input placeholder="Nom de la cuisine * (ex : Libanais)" [value]="cNom()" (input)="cNom.set($any($event.target).value)" />
          <input placeholder="Description" [value]="cDescription()" (input)="cDescription.set($any($event.target).value)" />
          <select (change)="cIcon.set($any($event.target).value)">
            @for (i of icons; track i.value) { <option [value]="i.value" [selected]="i.value === cIcon()">Icône : {{ i.label }}</option> }
          </select>
          <div class="row">
            <button type="button" class="btn-tomato" (click)="saveCuisine()">{{ editingCuisine() ? 'Enregistrer' : 'Ajouter la cuisine' }}</button>
            @if (editingCuisine()) { <button type="button" class="btn-ghost" (click)="resetCuisine()">Annuler</button> }
          </div>
        </div>

        @for (c of cuisines(); track c._id) {
          <div class="item">
            <div class="info"><strong>{{ c.nom }}</strong><small>{{ c.description || 'Aucune description' }} · {{ c.restaurants ?? 0 }} restaurant(s)</small></div>
            <button type="button" class="btn-ghost" (click)="editCuisine(c)">Modifier</button>
            <button type="button" class="btn-ghost" (click)="removeCuisine(c)">Supprimer</button>
          </div>
        }
        @if (!cuisines().length) { <p>Aucune cuisine enregistrée. Ajoutez-en une ci-dessus (ou lancez « npm run seed:cuisines » dans le backend).</p> }
      }

      <!-- ===================== UTILISATEURS ===================== -->
      @if (tab() === 'users') {
        <div class="toolbar">
          <input type="search" placeholder="Rechercher par nom, prénom ou email" aria-label="Rechercher un utilisateur" (input)="onUserSearch($any($event.target).value)" />
          <select aria-label="Filtrer par rôle" (change)="setUserRole($any($event.target).value)">
            <option value="">Tous les rôles</option>
            @for (r of roles; track r) { <option [value]="r">{{ r }}</option> }
          </select>
          <small>{{ userTotal() }} utilisateur(s)</small>
        </div>

        @for (u of users(); track uid(u)) {
          <div class="item">
            <div class="info"><strong>{{ u.prenom }} {{ u.nom }}</strong><small>{{ u.email }}{{ u.isActive === false ? ' · compte désactivé' : '' }}</small></div>
            <select (change)="setRole(u, $any($event.target).value)">
              @for (r of roles; track r) { <option [value]="r" [selected]="u.role === r">{{ r }}</option> }
            </select>
            <button type="button" class="btn-ghost" (click)="toggleActive(u)">{{ u.isActive === false ? 'Réactiver' : 'Désactiver' }}</button>
          </div>
        }
        @if (!users().length) { <p>Aucun utilisateur ne correspond.</p> }

        @if (userPages() > 1) {
          <div class="pagination">
            <button type="button" class="btn-ghost" [disabled]="userPage() <= 1" (click)="goUsers(userPage() - 1)">← Précédent</button>
            <span class="page-info">Page {{ userPage() }} / {{ userPages() }}</span>
            <button type="button" class="btn-ghost" [disabled]="userPage() >= userPages()" (click)="goUsers(userPage() + 1)">Suivant →</button>
          </div>
        }
      }
    </div></section>
  `,
  styles: [`
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; margin: 16px 0; }
    .stat { padding: 14px 16px; border: 1px solid rgba(128,128,128,.3); border-radius: 16px; display: grid; gap: 4px; }
    .stat strong { font-size: 1.4rem; }
    .tabs { display: flex; flex-wrap: wrap; gap: 8px; margin: 16px 0; }
    .form { display: grid; gap: 10px; max-width: 520px; margin: 16px 0; }
    .form.edit { padding: 14px 16px; border: 1px dashed rgba(128,128,128,.5); border-radius: 14px; max-width: none; }
    .row { display: flex; flex-wrap: wrap; gap: 10px; }
    .toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 16px 0; }
    .toolbar input { flex: 1; min-width: 220px; }
    .hint { opacity: .7; margin: 8px 0; }
    input { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .item { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 12px 16px; margin: 8px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .info { flex: 1; min-width: 180px; display: grid; }
    .badge { padding: 4px 12px; border-radius: 999px; font-size: .85rem; font-weight: 700; border: 1px solid rgba(128,128,128,.4); }
    .badge[data-s="en_attente"] { background: #f5a623; color: #000; }
    .badge[data-s="valide"] { background: #2e9e5b; color: #fff; }
    .badge[data-s="suspendu"] { background: #e5484d; color: #fff; }
    select { padding: 8px 12px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .page-info { align-self: center; }
    .error { color: #e5484d; font-weight: 600; }
    .success { color: #2e9e5b; font-weight: 600; }
  `]
})
export class Admin implements OnInit {
  private api = inject(AdminService);
  private cuisineApi = inject(CuisineService);

  stats = signal<AdminStats | null>(null);
  restaurants = signal<AdminRestaurant[]>([]);
  restaurateurs = signal<AdminUser[]>([]);
  cuisines = signal<Cuisine[]>([]);
  cuisineNames = signal<string[]>([]);
  tab = signal<'restaurants' | 'cuisines' | 'users'>('restaurants');
  filter = signal('');
  error = signal('');
  success = signal('');

  // Formulaire de création de restaurant
  showForm = signal(false);
  nom = signal(''); adresse = signal(''); cuisine = signal(''); frais = signal(''); owner = signal('');

  // Formulaire de modification d'un restaurant
  editId = signal('');
  eNom = signal(''); eDescription = signal(''); eAdresse = signal(''); eCuisine = signal(''); eHoraires = signal(''); eFrais = signal(''); eImage = signal('');

  // Formulaire des cuisines
  editingCuisine = signal('');
  cNom = signal(''); cDescription = signal(''); cIcon = signal('utensils');
  icons = [
    { value: 'utensils', label: 'couverts' }, { value: 'pizza', label: 'pizza' }, { value: 'sandwich', label: 'sandwich' },
    { value: 'salad', label: 'salade' }, { value: 'cake-slice', label: 'dessert' }
  ];

  // Utilisateurs : recherche, filtre par rôle, pagination
  users = signal<AdminUser[]>([]);
  userRole = signal('');
  userPage = signal(1);
  userPages = signal(1);
  userTotal = signal(0);
  private userSearch = '';
  private timer: any; // délai pour ne pas appeler l'API à chaque lettre

  roles = ['client', 'restaurateur', 'admin'];
  filters = [
    { value: '', label: 'Tous' }, { value: 'en_attente', label: 'À valider' },
    { value: 'valide', label: 'Validés' }, { value: 'suspendu', label: 'Suspendus' }
  ];

  private fail = (err: any) => { this.success.set(''); this.error.set(err.error?.message || 'Une erreur est survenue.'); };
  private reset() { this.error.set(''); this.success.set(''); }

  ngOnInit() { this.loadAll(); }

  uid(u: AdminUser) { return u._id || u.id || u.email; }
  statusLabel(s: string) { return ({ en_attente: 'à valider', valide: 'validé', suspendu: 'suspendu' } as Record<string, string>)[s] ?? s; }

  // Cuisines proposées dans le formulaire de modification (+ la cuisine actuelle si elle n'est plus dans la liste)
  editCuisines() {
    return this.eCuisine() && !this.cuisineNames().includes(this.eCuisine()) ? [this.eCuisine(), ...this.cuisineNames()] : this.cuisineNames();
  }

  private loadAll() {
    this.api.stats().subscribe({ next: (s) => this.stats.set(s), error: this.fail });
    this.loadRestaurants();
    this.loadCuisines();
    this.loadUsers();
    this.api.restaurateurs().subscribe({ next: (u) => this.restaurateurs.set(u), error: this.fail });
  }

  private loadRestaurants() {
    this.api.restaurants(this.filter() || undefined).subscribe({ next: (r) => this.restaurants.set(r), error: this.fail });
  }
  private loadCuisines() {
    this.cuisineApi.listRaw().subscribe({
      next: (c) => { this.cuisines.set(c); this.cuisineNames.set(c.map((x) => x.nom)); },
      error: this.fail
    });
  }
  private loadUsers() {
    this.api.users({ search: this.userSearch || undefined, role: this.userRole() || undefined, page: this.userPage(), limit: 10 }).subscribe({
      next: (r) => { this.users.set(r.users); this.userPages.set(r.pages); this.userTotal.set(r.total); },
      error: this.fail
    });
  }

  setFilter(v: string) { this.filter.set(v); this.loadRestaurants(); }

  // ---------- Restaurants ----------
  create() {
    this.reset();
    if (!this.nom().trim() || !this.adresse().trim() || !this.cuisine() || !this.owner()) {
      this.error.set('Nom, adresse, cuisine et propriétaire sont obligatoires.');
      return;
    }
    this.api.createRestaurant({
      nom: this.nom().trim(), adresse: this.adresse().trim(), typeCuisine: this.cuisine(),
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
    this.reset();
    this.api.setRestaurantStatus(r._id, status).subscribe({ next: () => this.loadAll(), error: this.fail });
  }

  // Ouvre le formulaire de modification, prérempli
  startEdit(r: AdminRestaurant) {
    this.reset();
    this.editId.set(r._id);
    this.eNom.set(r.nom); this.eDescription.set(r.description ?? ''); this.eAdresse.set(r.adresse); this.eCuisine.set(r.typeCuisine);
    this.eHoraires.set(r.horaires ?? ''); this.eFrais.set(String(r.fraisLivraison ?? 0)); this.eImage.set(r.image ?? '');
  }

  saveRestaurant(r: AdminRestaurant) {
    this.reset();
    const frais = Number(this.eFrais().replace(',', '.'));
    if (!this.eNom().trim() || !this.eAdresse().trim() || !this.eCuisine() || isNaN(frais) || frais < 0) {
      this.error.set('Nom, adresse, cuisine et frais de livraison (nombre positif) sont obligatoires.');
      return;
    }
    this.api.updateRestaurant(r._id, {
      nom: this.eNom().trim(), description: this.eDescription().trim(), adresse: this.eAdresse().trim(), typeCuisine: this.eCuisine(),
      horaires: this.eHoraires().trim(), fraisLivraison: frais, image: this.eImage().trim()
    }).subscribe({
      next: () => { this.success.set('Restaurant modifié.'); this.editId.set(''); this.loadAll(); },
      error: this.fail
    });
  }

  removeRestaurant(r: AdminRestaurant) {
    if (!confirm(`Supprimer « ${r.nom} » avec toutes ses catégories et tous ses plats ? Cette action est définitive.`)) return;
    this.reset();
    this.api.deleteRestaurant(r._id).subscribe({ next: () => { this.success.set('Restaurant supprimé.'); this.loadAll(); }, error: this.fail });
  }

  // ---------- Cuisines ----------
  editCuisine(c: Cuisine) {
    this.reset();
    this.editingCuisine.set(c._id); this.cNom.set(c.nom); this.cDescription.set(c.description ?? ''); this.cIcon.set(c.icon || 'utensils');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  resetCuisine() { this.editingCuisine.set(''); this.cNom.set(''); this.cDescription.set(''); this.cIcon.set('utensils'); }

  saveCuisine() {
    this.reset();
    if (!this.cNom().trim()) { this.error.set('Le nom de la cuisine est obligatoire.'); return; }
    const data = { nom: this.cNom().trim(), description: this.cDescription().trim(), icon: this.cIcon() };
    const done = { next: () => { this.success.set(this.editingCuisine() ? 'Cuisine modifiée.' : 'Cuisine ajoutée.'); this.resetCuisine(); this.loadCuisines(); this.loadRestaurants(); }, error: this.fail };
    if (this.editingCuisine()) this.cuisineApi.update(this.editingCuisine(), data).subscribe(done);
    else this.cuisineApi.create(data).subscribe(done);
  }

  removeCuisine(c: Cuisine) {
    if (!confirm(`Supprimer la cuisine « ${c.nom} » ?`)) return;
    this.reset();
    // Le serveur refuse si des restaurants utilisent encore cette cuisine
    this.cuisineApi.remove(c._id).subscribe({ next: () => { this.success.set('Cuisine supprimée.'); this.loadCuisines(); }, error: this.fail });
  }

  // ---------- Utilisateurs ----------
  onUserSearch(text: string) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => { this.userSearch = text.trim(); this.userPage.set(1); this.loadUsers(); }, 300);
  }
  setUserRole(role: string) { this.userRole.set(role); this.userPage.set(1); this.loadUsers(); }
  goUsers(p: number) { this.userPage.set(p); this.loadUsers(); }

  setRole(u: AdminUser, role: string) {
    this.reset();
    this.api.setRole(this.uid(u)!, role).subscribe({ next: () => this.loadAll(), error: (e) => { this.fail(e); this.loadUsers(); } });
  }

  toggleActive(u: AdminUser) {
    this.reset();
    this.api.setActive(this.uid(u)!, u.isActive === false).subscribe({ next: () => this.loadUsers(), error: this.fail });
  }
}
