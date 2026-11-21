import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  template: `
    <!-- 1. HERO : grande photo en fond, titre doré -->
    <section class="hero">
      <img class="bg" src="img/hero.jpg" alt="" (error)="hide($event)">
      <div class="shade"></div>
      <div class="container inner">
        <p class="kicker">Livraison de repas · Tunisie</p>
        <h1>Le goût authentique<br>de la Tunisie,<br>livré chez vous.</h1>
        <p class="lead">Les meilleurs restaurants de votre ville, à portée de clic. Commandez, puis suivez votre repas jusqu'à votre porte.</p>
        <div class="cta">
          <a routerLink="/restaurants" class="btn-honey">Commander maintenant</a>
          <a routerLink="/register" class="btn-cream">Créer un compte</a>
        </div>
      </div>
    </section>

    <!-- 2. Trois cartes -->
    <section class="container block">
      <h2 class="sec-title">Pourquoi Carthage Table</h2>
      <div class="row g-4 mt-1">
        @for (v of values; track v.title) {
          <div class="col-md-4">
            <div class="glass value">
              <span class="icon"><i [class]="'bi ' + v.icon"></i></span>
              <h3>{{ v.title }}</h3>
              <p>{{ v.text }}</p>
            </div>
          </div>
        }
      </div>
    </section>

    <!-- 3. Image + texte -->
    <section class="container block split">
      <img src="img/plat1.jpg" alt="Plat signature" (error)="hide($event)">
      <div>
        <p class="kicker gold">Notre promesse</p>
        <h2>Chaque plat raconte une histoire</h2>
        <p class="text">Des recettes traditionnelles aux classiques que tout le monde aime, nos restaurants partenaires cuisinent pour vous avec des produits frais. Vous choisissez, ils préparent, nous livrons.</p>
        <a routerLink="/restaurants" class="btn-gold">Découvrir les restaurants</a>
      </div>
    </section>

    <!-- 4. Plats du moment (liste avec prix) + photo -->
    <section class="container block split reverse">
      <div>
        <p class="kicker gold">Les plats du moment</p>
        <h2>Un menu qui donne faim</h2>
        @for (d of dishes; track d.nom) {
          <div class="row-dish">
            <div><b>{{ d.nom }}</b><small>{{ d.text }}</small></div>
            <span class="dots"></span>
            <strong class="price">{{ d.prix }} DT</strong>
          </div>
        }
        <a routerLink="/restaurants" class="btn-ghost mt-3">Voir tous les restaurants</a>
      </div>
      <img src="img/plat2.jpg" alt="Plat du moment" (error)="hide($event)">
    </section>
  `,
  styles: `
    /* HERO */
    .hero { position: relative; min-height: 80vh; display: flex; align-items: center; overflow: hidden; background: radial-gradient(circle at 75% 30%, #1f4d36, #0b1a12 70%); }
    .bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    /* Voile vert sombre à gauche pour que le texte reste lisible, qui se fond dans la page en bas */
    .shade { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(5, 15, 10, 0.92) 0%, rgba(5, 15, 10, 0.55) 55%, rgba(5, 15, 10, 0.15) 100%), linear-gradient(0deg, var(--bg) 0%, transparent 25%); }
    .inner { position: relative; padding-top: 4rem; padding-bottom: 5rem; }
    .kicker { color: var(--honey); letter-spacing: 0.2em; text-transform: uppercase; font-size: 0.78rem; font-weight: 600; }
    .kicker.gold { color: var(--gold); }
    .hero h1 { color: var(--honey); font-size: clamp(2.6rem, 6.5vw, 5rem); margin: 1rem 0; text-shadow: 0 4px 24px rgba(0, 0, 0, 0.5); }
    .lead { color: var(--cream); max-width: 480px; font-size: 1.1rem; opacity: 0.9; }
    .cta { display: flex; gap: 1rem; margin-top: 2rem; flex-wrap: wrap; }

    /* Sections */
    .block { padding: 3.5rem 1rem 0; }
    .sec-title { text-align: center; color: var(--gold); font-size: clamp(1.9rem, 4vw, 2.8rem); }
    .sec-title::after { content: ''; display: block; width: 70px; height: 2px; background: var(--gold); margin: 1rem auto 0; }

    .value { padding: 2rem 1.5rem; text-align: center; height: 100%; }
    .icon { display: grid; place-items: center; width: 64px; height: 64px; margin: 0 auto 1rem; border: 1.5px solid var(--gold); border-radius: 50%; font-size: 1.6rem; color: var(--gold); }    .value h3 { font-size: 1.3rem; margin-bottom: 0.5rem; }
    .value p { color: var(--muted); margin: 0; font-size: 0.92rem; }

    .split { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; align-items: center; }
    .split img { width: 100%; height: 380px; object-fit: cover; border-radius: 20px; border: 1px solid var(--border); }
    .split h2 { font-size: clamp(1.8rem, 4vw, 2.6rem); margin: 0.6rem 0 1rem; }
    .text { color: var(--muted); margin-bottom: 1.5rem; }
    .reverse > div { order: 1; }

    /* Liste de plats avec pointillés et prix */
    .row-dish { display: flex; align-items: flex-end; gap: 0.6rem; margin-bottom: 1.1rem; }
    .row-dish b { display: block; }
    .row-dish small { color: var(--muted); }
    .dots { flex: 1; border-bottom: 2px dotted var(--border); margin-bottom: 0.45rem; }
    .price { color: var(--gold); white-space: nowrap; }

    @media (max-width: 900px) {
      .split { grid-template-columns: 1fr; gap: 1.5rem; }
      .split img { height: 260px; }
      .reverse > div { order: 0; }
    }
  `
})
export class Home {
  values = [
  { icon: 'bi-shop', title: 'Restaurants partenaires', text: 'Des adresses sélectionnées, validées par notre équipe, pour tous les goûts.' },
  { icon: 'bi-truck', title: 'Livraison à domicile', text: 'Votre repas arrive chaud chez vous, et vous suivez sa préparation étape par étape.' },
  { icon: 'bi-cash-coin', title: 'Paiement à la livraison', text: 'Vous payez à la réception, et le total affiché est celui que vous payez.' }
];

  dishes = [
    { nom: 'Pizza Margherita', text: 'Tomate, mozzarella et basilic', prix: 15 },
    { nom: 'Couscous Agneau', text: 'Couscous traditionnel avec légumes', prix: 22 },
    { nom: 'Ojja Merguez', text: 'Œufs, tomates et merguez', prix: 14 },
    { nom: 'Tiramisu', text: 'Dessert italien au café', prix: 7 }
  ];

  // Cache une image introuvable (la page reste propre)
  hide(event: Event) {
    (event.target as HTMLImageElement).style.display = 'none';
  }
}