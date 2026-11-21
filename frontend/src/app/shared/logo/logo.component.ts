import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  template: `
    <span class="logo" [class.light]="light()">
      <svg viewBox="0 0 64 64" [attr.width]="size()" [attr.height]="size()" aria-hidden="true">
        <g fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M10 33h44a22 22 0 0 1-44 0z" />
          <path d="M22 25c-3-3 3-5 0-10M32 25c-3-3 3-5 0-10M42 25c-3-3 3-5 0-10" class="steam" />
          <path d="M26 46c4 3 8 3 12 0" />
        </g>
      </svg>
      <span class="word">
        <b>Carthage</b>
        <i>table</i>
      </span>
    </span>
  `,
  styles: [`
    .logo { display: inline-flex; align-items: center; gap: .55rem; color: var(--indigo); }
    .logo.light { color: #fff; }
    .word { display: grid; line-height: .95; }
    b { font: 700 1.45rem var(--font-display); letter-spacing: -.02em; }
    i { font: 600 1.35rem var(--font-script); color: var(--brown); margin-left: .1rem; }
    .light i { color: #f0d9b5; }
    .steam { animation: steam 3s ease-in-out infinite; }
    @keyframes steam { 50% { transform: translateY(-2px); opacity: .5; } }
  `],
})
export class LogoComponent {
  size = input(40);
  light = input(false);
}
