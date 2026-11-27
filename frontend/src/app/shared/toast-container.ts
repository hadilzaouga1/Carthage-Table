import { Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast-item" [class]="'toast-item toast-' + t.type" role="status">
          <span class="toast-dot" aria-hidden="true"></span>
          <span class="toast-text">{{ t.text }}</span>
          <button type="button" class="toast-close" (click)="toast.dismiss(t.id)" aria-label="Fermer">✕</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-stack {
      position: fixed; top: 82px; right: 20px; z-index: 9999;
      display: grid; gap: 10px; max-width: 360px; pointer-events: none;
    }
    .toast-item {
      pointer-events: auto;
      display: flex; align-items: center; gap: 10px;
      padding: 13px 16px; border-radius: 12px;
      background: var(--card); color: var(--foreground);
      border: 1px solid var(--border);
      box-shadow: 0 10px 28px rgba(0, 0, 0, .14);
      font-size: 13px; font-weight: 500;
      animation: toastIn .22s ease-out;
    }
    .toast-success { border-left: 4px solid #2e9e5b; }
    .toast-success .toast-dot { background: #2e9e5b; }
    .toast-error { border-left: 4px solid #e5484d; }
    .toast-error .toast-dot { background: #e5484d; }
    .toast-info { border-left: 4px solid var(--primary); }
    .toast-info .toast-dot { background: var(--primary); }
    .toast-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .toast-text { flex: 1; }
    .toast-close {
      border: 0; background: transparent; color: var(--muted-foreground);
      cursor: pointer; font-size: 13px; padding: 2px 4px;
    }
    .toast-close:hover { color: var(--foreground); }
    @keyframes toastIn {
      from { opacity: 0; transform: translateY(-8px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastContainer {
  toast = inject(ToastService);
}
