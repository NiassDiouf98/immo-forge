import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  imports: [MatIconModule],
  template: `
    <div class="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-[calc(100%-2rem)] max-w-sm">
      @for (t of toast.toasts(); track t.id) {
        <div class="flex items-start gap-3 rounded-2xl px-4 py-3 shadow-xl text-white animate-[fadeInUp_.3s_ease-out]"
             [class.bg-primary]="t.type === 'success'"
             [class.bg-red-600]="t.type === 'error'"
             [class.bg-bluegray]="t.type === 'info'">
          <mat-icon>{{ t.type === 'success' ? 'check_circle' : t.type === 'error' ? 'error' : 'info' }}</mat-icon>
          <p class="flex-1 text-sm pt-0.5">{{ t.text }}</p>
          <button (click)="toast.dismiss(t.id)" aria-label="Fermer"><mat-icon class="!text-lg">close</mat-icon></button>
        </div>
      }
    </div>
  `,
})
export class ToastHost {
  toast = inject(ToastService);
}
