// Page « Mon menu » (restaurateur) : créer son restaurant, gérer ses catégories et ses plats.
import { Component, inject, signal, OnInit } from '@angular/core';
import { CuisineService } from '../core/cuisine.service';
import { MenuService, MyRestaurant, Cat, MenuDish } from '../core/menu.service';

@Component({
  selector: 'app-menu-manager',
  standalone: true,
  template: `
    <section class="section"><div class="container">
      <h2>Mon menu<span class="text-primary">.</span></h2>
      @if (error()) { <p class="error">{{ error() }}</p> }

      <!-- Pas encore de restaurant : formulaire de création -->
      @if (!restaurants().length) {
        <p>Vous n'avez pas encore de restaurant. Créez le vôtre : il sera visible des clients après validation par l'administrateur.</p>
        <div class="form">
          <input placeholder="Nom du restaurant *" [value]="rNom()" (input)="rNom.set($any($event.target).value)" />
          <input placeholder="Adresse *" [value]="rAdresse()" (input)="rAdresse.set($any($event.target).value)" />
          <select (change)="rCuisine.set($any($event.target).value)">
            <option value="">Type de cuisine *</option>
            @for (c of cuisineService.cuisines(); track c._id) { <option [value]="c.nom" [selected]="c.nom === rCuisine()">{{ c.icon }} {{ c.nom }}</option> }
          </select>
          <input placeholder="Frais de livraison en DT (ex : 5, vide = gratuit)" [value]="rFrais()" (input)="rFrais.set($any($event.target).value)" />
          <button type="button" class="btn-tomato" (click)="createRestaurant()">Créer mon restaurant</button>
        </div>
      } @else {
        <!-- Choix du restaurant + ouvert / fermé -->
        <div class="row">
          <select (change)="select($any($event.target).value)">
            @for (r of restaurants(); track r._id) { <option [value]="r._id" [selected]="r._id === currentId()">{{ r.nom }}</option> }
          </select>
          @if (current(); as c) {
            <button type="button" class="btn-ghost" (click)="toggleOpen(c)">{{ c.isOpen ? 'Fermer le restaurant' : 'Ouvrir le restaurant' }}</button>
          }
        </div>
        @if (current() && current()!.status !== 'valide') {
          <p class="notice">Ce restaurant est « {{ current()!.status }} » : les clients ne le voient pas tant que l'administrateur ne l'a pas validé.</p>
        }

        <!-- CATÉGORIES -->
        <h3>Catégories</h3>
        <div class="row">
          @for (c of categories(); track c._id) {
            <span class="chip">{{ c.nom }} <button type="button" (click)="removeCategory(c)" aria-label="Supprimer">✕</button></span>
          }
          @if (!categories().length) { <small>Créez d'abord une catégorie (Pizzas, Boissons...).</small> }
        </div>
        <div class="row">
          <input placeholder="Nouvelle catégorie" [value]="catName()" (input)="catName.set($any($event.target).value)" />
          <button type="button" class="btn-tomato" (click)="addCategory()">Ajouter</button>
        </div>

        <!-- PLATS : formulaire d'ajout / modification -->
        <h3>{{ editingId() ? 'Modifier le plat' : 'Ajouter un plat' }}</h3>
        <div class="form">
          <input placeholder="Nom du plat *" [value]="nom()" (input)="nom.set($any($event.target).value)" />
          <input placeholder="Prix en DT *" [value]="prix()" (input)="prix.set($any($event.target).value)" />
          <input placeholder="Description" [value]="description()" (input)="description.set($any($event.target).value)" />
          <input placeholder="Emoji (ex : 🍕)" [value]="icon()" (input)="icon.set($any($event.target).value)" />
          <select (change)="categorie.set($any($event.target).value)">
            <option value="">Catégorie *</option>
            @for (c of categories(); track c._id) { <option [value]="c._id" [selected]="c._id === categorie()">{{ c.nom }}</option> }
          </select>
          <div class="row">
            <button type="button" class="btn-tomato" (click)="saveDish()">{{ editingId() ? 'Enregistrer' : 'Ajouter le plat' }}</button>
            @if (editingId()) { <button type="button" class="btn-ghost" (click)="resetDish()">Annuler</button> }
          </div>
        </div>

        <!-- LISTE DES PLATS -->
        <h3>Mes plats ({{ dishes().length }})</h3>
        @for (d of dishes(); track d._id) {
          <div class="dish">
            <span class="ico">{{ d.icon }}</span>
            <div class="info"><strong>{{ d.nom }}</strong><small>{{ catName2(d.categorie) }} · {{ d.prix.toFixed(2) }} DT</small></div>
            <button type="button" class="btn-ghost" (click)="toggleDish(d)">{{ d.disponible ? 'Disponible' : 'Indisponible' }}</button>
            <button type="button" class="btn-ghost" (click)="edit(d)">Modifier</button>
            <button type="button" class="btn-ghost" (click)="removeDish(d)">Supprimer</button>
          </div>
        }
      }
    </div></section>
  `,
  styles: [`
    h3 { margin: 28px 0 10px; }
    .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin: 8px 0; }
    .form { display: grid; gap: 10px; max-width: 520px; }
    input, select { padding: 10px 14px; border-radius: 12px; border: 1px solid rgba(128,128,128,.4); background: transparent; color: inherit; font: inherit; }
    .chip { display: inline-flex; gap: 8px; align-items: center; padding: 6px 12px; border-radius: 999px; border: 1px solid rgba(128,128,128,.4); }
    .chip button { border: 0; background: transparent; color: inherit; cursor: pointer; }
    .dish { display: flex; align-items: center; gap: 12px; padding: 10px 14px; margin: 8px 0; border: 1px solid rgba(128,128,128,.3); border-radius: 14px; }
    .ico { font-size: 1.8rem; }
    .info { flex: 1; display: grid; }
    .notice { padding: 10px 14px; border-radius: 12px; border: 1px solid #f5a623; }
    .error { color: #e5484d; font-weight: 600; }
  `]
})
export class MenuManager implements OnInit {
  private api = inject(MenuService);
  cuisineService = inject(CuisineService);

  restaurants = signal<MyRestaurant[]>([]);
  currentId = signal('');
  categories = signal<Cat[]>([]);
  dishes = signal<MenuDish[]>([]);
  error = signal('');

  // Formulaire « créer mon restaurant »
  rNom = signal(''); rAdresse = signal(''); rCuisine = signal(''); rFrais = signal('');
  // Formulaire catégorie et plat
  catName = signal('');
  editingId = signal('');
  nom = signal(''); prix = signal(''); description = signal(''); icon = signal('🍽️'); categorie = signal('');

  // Affiche le message d'erreur renvoyé par le serveur
  private fail = (err: any) => this.error.set(err.error?.message || 'Une erreur est survenue.');

  ngOnInit() {
    this.cuisineService.load().subscribe({ error: () => {} });
    this.loadRestaurants();
  }

  current() { return this.restaurants().find((r) => r._id === this.currentId()); }
  catName2(id: string) { return this.categories().find((c) => c._id === id)?.nom ?? ''; }

  private loadRestaurants() {
    this.api.myRestaurants().subscribe({
      next: (list) => {
        this.restaurants.set(list);
        if (list.length) this.select(this.currentId() || list[0]._id);
      },
      error: this.fail
    });
  }

  select(id: string) { this.currentId.set(id); this.resetDish(); this.loadMenu(); }

  private loadMenu() {
    const id = this.currentId();
    this.api.categories(id).subscribe({ next: (c) => this.categories.set(c), error: this.fail });
    this.api.dishes(id).subscribe({ next: (d) => this.dishes.set(d), error: this.fail });
  }

  createRestaurant() {
    if (!this.rNom().trim() || !this.rAdresse().trim() || !this.rCuisine().trim()) { this.error.set('Nom, adresse et cuisine sont obligatoires.'); return; }
    this.error.set('');
    this.api.createRestaurant({
      nom: this.rNom().trim(), adresse: this.rAdresse().trim(), typeCuisine: this.rCuisine().trim(),
      fraisLivraison: Number(this.rFrais().replace(',', '.')) || 0 // champ vide = livraison gratuite
    }).subscribe({ next: () => this.loadRestaurants(), error: this.fail });
  }

  toggleOpen(r: MyRestaurant) { this.api.setOpen(r._id, !r.isOpen).subscribe({ next: () => this.loadRestaurants(), error: this.fail }); }

  addCategory() {
    if (!this.catName().trim()) return;
    this.error.set('');
    this.api.addCategory(this.currentId(), this.catName().trim()).subscribe({ next: () => { this.catName.set(''); this.loadMenu(); }, error: this.fail });
  }
  removeCategory(c: Cat) {
    if (!confirm(`Supprimer la catégorie « ${c.nom} » ?`)) return;
    this.error.set('');
    // Le serveur refuse si la catégorie contient encore des plats
    this.api.deleteCategory(c._id).subscribe({ next: () => this.loadMenu(), error: this.fail });
  }

  resetDish() { this.editingId.set(''); this.nom.set(''); this.prix.set(''); this.description.set(''); this.icon.set('🍽️'); this.categorie.set(''); }

  edit(d: MenuDish) {
    this.editingId.set(d._id); this.nom.set(d.nom); this.prix.set(String(d.prix));
    this.description.set(d.description); this.icon.set(d.icon); this.categorie.set(d.categorie);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveDish() {
    const prix = Number(this.prix().replace(',', '.'));
    if (!this.nom().trim() || isNaN(prix) || prix < 0 || !this.categorie()) { this.error.set('Nom, prix et catégorie sont obligatoires.'); return; }
    this.error.set('');
    const data = { nom: this.nom().trim(), prix, description: this.description().trim(), icon: this.icon() || '🍽️', categorie: this.categorie() };
    const done = { next: () => { this.resetDish(); this.loadMenu(); }, error: this.fail };
    if (this.editingId()) this.api.updateDish(this.editingId(), data).subscribe(done);
    else this.api.addDish({ ...data, restaurant: this.currentId() }).subscribe(done);
  }

  // Rendre un plat disponible / indisponible (un plat indisponible ne peut pas être commandé)
  toggleDish(d: MenuDish) { this.api.updateDish(d._id, { disponible: !d.disponible }).subscribe({ next: () => this.loadMenu(), error: this.fail }); }

  removeDish(d: MenuDish) {
    if (!confirm(`Supprimer « ${d.nom} » ?`)) return;
    this.api.deleteDish(d._id).subscribe({ next: () => this.loadMenu(), error: this.fail });
  }
}