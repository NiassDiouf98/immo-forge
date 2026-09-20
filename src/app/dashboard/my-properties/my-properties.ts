import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Bien, Pagination as Pag } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { Pagination } from '../../shared/components/pagination/pagination';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-my-properties',
  imports: [CommonModule, MatIconModule, RouterLink, Badge, Pagination],
  templateUrl: './my-properties.html',
})
export class MyProperties implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);

  biens = signal<Bien[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load(1);
    this.socket.live('bien:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.api.mesBiens({ page, limit: 10 }).subscribe({
      next: r => { this.biens.set(r.biens); this.pagination.set(r.pagination); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  img(b: Bien) { return this.api.fileUrl(b.images?.[0]?.url_image); }

  remove(b: Bien) {
    if (!confirm(`Supprimer « ${b.titre} » ? Cette action est définitive.`)) return;
    this.api.deleteBien(b.id).subscribe({
      next: () => { this.toast.success('Bien supprimé'); this.load(this.pagination().page); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
