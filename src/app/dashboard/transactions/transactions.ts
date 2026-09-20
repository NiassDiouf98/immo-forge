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
import { AuthService } from '../../core/services/auth.service';
import { Transaction } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { errorMessage, fullName } from '../../utils/helpers';

@Component({
  selector: 'app-transactions',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, Badge],
  templateUrl: './transactions.html',
})
export class Transactions implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);

  fullName = fullName;
  transactions = signal<Transaction[]>([]);
  loading = signal(true);
  error = signal('');
  paying = signal<Transaction | null>(null);
  mode = 'wave';
  busy = false;

  modes = [
    { value: 'wave', label: 'Wave' },
    { value: 'orange_money', label: 'Orange Money' },
    { value: 'carte', label: 'Carte bancaire' },
    { value: 'virement', label: 'Virement' },
  ];

  ngOnInit() {
    this.load();
    this.socket.live('transaction:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  load() {
    this.api.transactions().subscribe({
      next: t => { this.transactions.set(t); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  confirmPay() {
    const t = this.paying();
    if (!t) return;
    this.busy = true;
    this.api.payerTransaction(t.id, this.mode).subscribe({
      next: () => { this.busy = false; this.paying.set(null); this.toast.success('Paiement enregistré'); this.load(); },
      error: e => { this.busy = false; this.toast.error(errorMessage(e)); },
    });
  }

  cancel(t: Transaction) {
    if (!confirm('Annuler cette transaction ?')) return;
    this.api.annulerTransaction(t.id).subscribe({
      next: () => { this.toast.success('Transaction annulée'); this.load(); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
