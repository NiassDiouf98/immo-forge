import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-pagination',
  imports: [MatIconModule],
  template: `
    @if (totalPages() > 1) {
      <nav class="flex justify-center items-center gap-2 my-10" aria-label="Pagination">
        <button (click)="go(page() - 1)" [disabled]="page() <= 1"
                class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center">
          <mat-icon>chevron_left</mat-icon>
        </button>
        @for (p of pages(); track p) {
          <button (click)="go(p)" class="w-10 h-10 rounded-full font-bold flex items-center justify-center"
                  [class.bg-primary]="p === page()" [class.text-white]="p === page()"
                  [class.bg-gray-200]="p !== page()" [class.hover:bg-gray-300]="p !== page()">{{ p }}</button>
        }
        <button (click)="go(page() + 1)" [disabled]="page() >= totalPages()"
                class="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-40 flex items-center justify-center">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </nav>
    }
  `,
})
export class Pagination {
  page = input.required<number>();
  totalPages = input.required<number>();
  pageChange = output<number>();

  pages = computed(() => {
    const total = this.totalPages();
    const start = Math.max(1, Math.min(this.page() - 2, total - 4));
    const end = Math.min(total, start + 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  go(p: number) {
    if (p >= 1 && p <= this.totalPages() && p !== this.page()) this.pageChange.emit(p);
  }
}
