import { Injectable, signal } from '@angular/core';

const KEY = 'ct_theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  // On relit le thème sauvegardé (sombre par défaut)
  theme = signal<'dark' | 'light'>(localStorage.getItem(KEY) === 'light' ? 'light' : 'dark');
  constructor() {
    this.apply();
  }

  // Bascule entre sombre et clair
  toggle() {
    this.theme.set(this.theme() === 'dark' ? 'light' : 'dark');
    localStorage.setItem(KEY, this.theme());
    this.apply();
  }

  // Écrit le thème sur la balise <html> : Bootstrap et notre CSS réagissent
  private apply() {
    document.documentElement.setAttribute('data-bs-theme', this.theme());
  }
}