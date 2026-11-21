import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** Page temporaire pour les espaces développés dans les parties suivantes. */
@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink],
  template: `
    <section class="container wrap">
      <div class="card box">
        <p class="script">bientôt à table</p>
        <h1>{{ title }}</h1>
        <a class="btn btn-primary" routerLink="/">Retour à l'accueil</a>
      </div>
    </section>
  `,
  styles: [`
    .wrap { display: grid; place-items: center; min-height: 60vh; padding: 3rem 0; }
    .box { padding: 2.6rem; max-width: 520px; text-align: center; }
    .script { font-size: 2rem; margin: 0; }
  `],
})
export class ComingSoonComponent {
  title: string = inject(ActivatedRoute).snapshot.data['title'] ?? 'Espace en construction';
}
