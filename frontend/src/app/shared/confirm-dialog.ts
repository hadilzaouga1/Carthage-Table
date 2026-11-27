import { Component, input, output } from '@angular/core';
import { Icon } from '../core/icon';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [Icon],
  template: `
    @if (open()) {
      <div
        class="confirm-backdrop"
        (click)="onBackdropClick($event)"
        (keydown.escape)="cancelled.emit()"
        tabindex="-1"
      >
        <div class="confirm-modal" role="dialog" aria-modal="true" [attr.aria-labelledby]="'confirm-dialog-title'">
          <div class="confirm-header">
            <div class="confirm-icon-wrap" [class.is-danger]="danger()">
              <app-icon [name]="iconName()"></app-icon>
            </div>
            <div class="confirm-text">
              <h3 id="confirm-dialog-title" class="confirm-title">{{ title() }}</h3>
              <p class="confirm-message">{{ message() }}</p>
            </div>
          </div>
          <div class="confirm-actions">
            <button type="button" class="dialog-btn dialog-btn-cancel" (click)="cancelled.emit()">
              {{ cancelText() }}
            </button>
            <button
              type="button"
              class="dialog-btn dialog-btn-confirm"
              [class.btn-danger]="danger()"
              (click)="confirmed.emit()"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .confirm-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      background: rgba(0, 0, 0, 0.55);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: backdropIn 0.18s ease-out;
    }
    .confirm-modal {
      width: 100%;
      max-width: 430px;
      background: var(--card);
      color: var(--foreground);
      border: 1px solid var(--border);
      border-radius: 20px;
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
      padding: 24px;
      animation: modalIn 0.22s cubic-bezier(0.16, 1, 0.3, 1);
      outline: none;
    }
    .confirm-header {
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }
    .confirm-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      background: var(--secondary);
      color: var(--primary);
    }
    .confirm-icon-wrap.is-danger {
      background: rgba(229, 72, 77, 0.12);
      color: #e5484d;
    }
    .confirm-text {
      flex: 1;
    }
    .confirm-title {
      font-size: 17px;
      font-weight: 700;
      margin: 0;
      color: var(--foreground);
    }
    .confirm-message {
      font-size: 13.5px;
      color: var(--muted-foreground);
      margin-top: 6px;
      line-height: 1.5;
    }
    .confirm-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 24px;
    }
    .dialog-btn {
      border-radius: 999px;
      min-height: 40px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.15s, background-color 0.15s;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .dialog-btn:hover {
      transform: translateY(-1px);
    }
    .dialog-btn-cancel {
      background: transparent;
      color: var(--foreground);
      border-color: var(--border);
    }
    .dialog-btn-cancel:hover {
      background: var(--secondary);
    }
    .dialog-btn-confirm {
      background: var(--primary);
      color: var(--primary-foreground);
    }
    .dialog-btn-confirm.btn-danger {
      background: #e5484d;
      color: #ffffff;
      border-color: #e5484d;
    }
    .dialog-btn-confirm.btn-danger:hover {
      background: #dc3e42;
    }
    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes modalIn {
      from { opacity: 0; transform: scale(0.93) translateY(8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
  `]
})
export class ConfirmDialog {
  open = input(false);
  title = input('Confirmation');
  message = input('Êtes-vous sûr de vouloir continuer ?');
  confirmText = input('Confirmer');
  cancelText = input('Annuler');
  danger = input(false);
  iconName = input('log-out');

  confirmed = output<void>();
  cancelled = output<void>();

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('confirm-backdrop')) {
      this.cancelled.emit();
    }
  }
}
