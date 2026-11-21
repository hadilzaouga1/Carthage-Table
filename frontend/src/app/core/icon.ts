// Composant d'icône maison : affiche une icône SVG (style Lucide, trait arrondi) à partir de son nom.
// Aucune bibliothèque à installer. Utilisation : <app-icon name="arrow-right" />
import { Component, computed, input } from '@angular/core';

// Chaque icône = une liste de tracés SVG (attribut "d"), dessinés sur une grille 24 x 24
const ICONS: Record<string, string[]> = {
  'arrow-right': ['M5 12h14', 'm12 5 7 7-7 7'],
  'arrow-up-right': ['M7 7h10v10', 'M7 17 17 7'],
  'chevron-right': ['m9 18 6-6-6-6'],
  'chevron-left': ['m15 18-6-6 6-6'],
  'menu': ['M4 12h16', 'M4 6h16', 'M4 18h16'],
  'x': ['M18 6 6 18', 'm6 6 12 12'],
  'search': ['M3 11a8 8 0 1 0 16 0a8 8 0 1 0-16 0', 'm21 21-4.3-4.3'],
  'shopping-bag': ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  'user': ['M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2', 'M8 7a4 4 0 1 0 8 0a4 4 0 1 0-8 0'],
  'sun': ['M8 12a4 4 0 1 0 8 0a4 4 0 1 0-8 0', 'M12 2v2', 'M12 20v2', 'm4.93 4.93 1.41 1.41', 'm17.66 17.66 1.41 1.41', 'M2 12h2', 'M20 12h2', 'm6.34 17.66-1.41 1.41', 'm19.07 4.93-1.41 1.41'],
  'moon': ['M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z'],
  'map-pin': ['M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z', 'M9 10a3 3 0 1 0 6 0a3 3 0 1 0-6 0'],
  'star': ['M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'],
  'bike': ['M15 17.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0', 'M2 17.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0', 'M14 5a1 1 0 1 0 2 0a1 1 0 1 0-2 0', 'M12 17.5V14l-3-3 4-3 2 3h2'],
  'sparkles': ['M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z', 'M20 3v4', 'M22 5h-4', 'M4 17v2', 'M5 18H3'],
  'leaf': ['M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z', 'M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12'],
  'heart': ['M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z'],
  'clock3': ['M2 12a10 10 0 1 0 20 0a10 10 0 1 0-20 0', 'M12 6v6h4'],
  'utensils': ['M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2', 'M7 2v20', 'M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7'],
  'pizza': ['M21 5C13 1 5 5 3 17l1 3 3 1C19 19 23 11 21 5Z', 'M10 10h.01', 'M15 12h.01', 'M9 15h.01'],
  'sandwich': ['M3 11h18', 'M5 11a7 7 0 0 1 14 0', 'M4 15h16', 'M5 19h14a1 1 0 0 0 1-1v-1H4v1a1 1 0 0 0 1 1Z'],
  'salad': ['M3 12h18a9 9 0 0 1-18 0Z', 'M8 12c0-3 2-5 4-5s4 2 4 5', 'M12 7V4'],
  'cake-slice': ['M3 20h18', 'M4 20v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6', 'M4 16c2 1 3 1 4 0s2-1 4 0 3 1 4 0 2-1 4 0', 'M12 12V8', 'M12 4v1']
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      @for (d of paths(); track $index) { <path [attr.d]="d" /> }
    </svg>
  `,
  styles: [':host { display: inline-flex; }']
})
export class Icon {
  name = input.required<string>();                         // nom de l'icône
  paths = computed(() => ICONS[this.name()] ?? []);       // tracés correspondants
}