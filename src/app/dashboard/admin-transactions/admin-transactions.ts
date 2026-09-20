import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { Pagination as Pag, Transaction } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { Pagination } from '../../shared/components/pagination/pagination';
import { errorMessage, fullName } from '../../utils/helpers';

@Component({
  selector: 'app-admin-transactions',
  imports: [CommonModule, FormsModule, RouterLink, Badge, Pagination],
  templateUrl: './admin-transactions.html',
})
export class AdminTransactions implements OnInit {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  fullName = fullName;

  transactions = signal<Transaction[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  revenus = signal(0);
  status = '';
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load(1);
    this.socket.live('transaction:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.api.adminTransactions({ page, status: this.status }).subscribe({
      next: r => { this.transactions.set(r.transactions); this.pagination.set(r.pagination); this.revenus.set(r.revenus); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }
}
