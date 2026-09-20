import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Pagination as Pag, User } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { Pagination } from '../../shared/components/pagination/pagination';
import { errorMessage, fullName } from '../../utils/helpers';

@Component({
  selector: 'app-admin-users',
  imports: [CommonModule, FormsModule, Badge, Pagination],
  templateUrl: './admin-users.html',
})
export class AdminUsers implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  me = inject(AuthService).user;
  fullName = fullName;

  users = signal<User[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  roleFilter = '';
  search = '';
  private searchTimer?: ReturnType<typeof setTimeout>;
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load(1);
    this.socket.live('user:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.api.users({ page, limit: 10, role_id: this.roleFilter, search: this.search }).subscribe({
      next: r => { this.users.set(r.users); this.pagination.set(r.pagination); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  onSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.load(1), 300);
  }

  changeRole(u: User, role_nom: string) {
    this.api.setUserRole(u.id, role_nom).subscribe({
      next: () => { this.toast.success('Rôle mis à jour'); this.load(this.pagination().page); },
      error: e => { this.toast.error(errorMessage(e)); this.load(this.pagination().page); },
    });
  }

  setStatut(u: User, statut: User['statut']) {
    this.api.updateUserStatut(u.id, statut).subscribe({
      next: () => { this.toast.success('Statut mis à jour'); this.users.update(l => l.map(x => (x.id === u.id ? { ...x, statut } : x))); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
