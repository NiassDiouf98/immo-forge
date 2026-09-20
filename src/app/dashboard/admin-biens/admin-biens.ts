import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
import { errorMessage, fullName } from '../../utils/helpers';

@Component({
  selector: 'app-admin-biens',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, Badge, Pagination],
  templateUrl: './admin-biens.html',
})
export class AdminBiens implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  fullName = fullName;

  biens = signal<Bien[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  statusFilter = '1';
  loading = signal(true);
  error = signal('');
  refusing = signal<Bien | null>(null);
  raison = '';

  ngOnInit() {
    this.load(1);
    this.socket.live('bien:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.api.adminBiens({ page, limit: 10, status_id: this.statusFilter }).subscribe({
      next: r => { this.biens.set(r.biens); this.pagination.set(r.pagination); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  img(b: Bien) { return this.api.fileUrl(b.images?.[0]?.url_image); }

  valider(b: Bien) {
    this.api.validerBien(b.id, 'valider').subscribe({
      next: () => { this.toast.success('Bien validé'); this.load(this.pagination().page); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  confirmRefuse() {
    const b = this.refusing();
    if (!b) return;
    this.api.validerBien(b.id, 'refuser', this.raison).subscribe({
      next: () => { this.toast.success('Bien refusé'); this.refusing.set(null); this.raison = ''; this.load(this.pagination().page); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  remove(b: Bien) {
    if (!confirm(`Supprimer définitivement « ${b.titre} » ?`)) return;
    this.api.deleteBien(b.id).subscribe({
      next: () => { this.toast.success('Bien supprimé'); this.load(this.pagination().page); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
