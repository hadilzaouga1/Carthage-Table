import { Component, input, output } from '@angular/core';
import { CUISINES } from '../../core/models/cuisines';

@Component({
  selector: 'app-cuisine-tabs',
  template: `
    <div class="cuisines" role="tablist" aria-label="Types de cuisine">
      @for (c of cuisines; track c.key) {
        <button type="button" role="tab" class="cuisine" [class.on]="value() === c.key"
                [attr.aria-selected]="value() === c.key" (click)="valueChange.emit(c.key)">
          <span class="bubble" aria-hidden="true">{{ c.icon }}</span>
          <span class="lbl">{{ c.key }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .cuisines { display: flex; gap: 1.2rem; overflow-x: auto; padding: .8rem .2rem 1rem; scrollbar-width: none; }
    .cuisine { background: none; border: 0; cursor: pointer; display: grid; justify-items: center; gap: .4rem; font: inherit; color: var(--muted); }
    .bubble { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; font-size: 2rem; background: var(--paper); box-shadow: var(--shadow); transition: transform .3s var(--ease), background .2s; }
    .cuisine:hover .bubble { transform: translateY(-4px); }
    .lbl { font-weight: 500; padding-bottom: 4px; border-bottom: 2px solid transparent; }
    .cuisine.on .lbl { color: var(--ink); border-color: var(--brown); font-weight: 700; }
    .cuisine.on .bubble { background: var(--indigo); box-shadow: 0 12px 22px -10px var(--indigo); }
  `],
})
export class CuisineTabsComponent {
  cuisines = CUISINES;
  value = input('Tous');
  valueChange = output<string>();
}
