import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { Demande, Pagination as Pag } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { Pagination } from '../../shared/components/pagination/pagination';
import { errorMessage, fullName } from '../../utils/helpers';

@Component({
  selector: 'app-admin-demandes',
  imports: [CommonModule, FormsModule, RouterLink, Badge, Pagination],
  templateUrl: './admin-demandes.html',
})
export class AdminDemandes implements OnInit {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  fullName = fullName;

  demandes = signal<Demande[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  statut = '';
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load(1);
    this.socket.live('demande:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.api.adminDemandes({ page, statut: this.statut }).subscribe({
      next: r => { this.demandes.set(r.demandes); this.pagination.set(r.pagination); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
