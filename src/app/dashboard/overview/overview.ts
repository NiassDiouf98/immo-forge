import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Bien, Stats } from '../../core/models/models';
import { errorMessage } from '../../utils/helpers';

interface Card { label: string; value: string | number; icon: string; link?: string; }

@Component({
  selector: 'app-overview',
  imports: [CommonModule, MatIconModule, RouterLink],
  templateUrl: './overview.html',
})
export class Overview implements OnInit {
  private api = inject(ApiService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  auth = inject(AuthService);

  data = signal<Stats | null>(null);
  error = signal('');
  pending = signal<Bien[]>([]);

  cards = computed<Card[]>(() => {
    const d = this.data();
    if (!d) return [];
    const s = d.stats;
    const fcfa = (n: number) => `${new Intl.NumberFormat('fr-FR').format(n)} FCFA`;
    if (d.role === 'admin') return [
      { label: 'Utilisateurs', value: s['users'], icon: 'group', link: '/dashboard/admin/users' },
      { label: 'Biens (total)', value: s['biens'], icon: 'home_work', link: '/dashboard/admin/biens' },
      { label: 'Biens à valider', value: s['biens_en_attente'], icon: 'pending_actions', link: '/dashboard/admin/biens' },
      { label: 'Biens en ligne', value: s['biens_valides'], icon: 'verified' },
      { label: 'Demandes', value: s['demandes'], icon: 'inbox' },
      { label: 'Chiffre d’affaires', value: fcfa(s['revenus']), icon: 'paid' },
    ];
    if (d.role === 'partenaire') return [
      { label: 'Mes biens', value: s['biens'], icon: 'home_work', link: '/dashboard/properties' },
      { label: 'Annonces en ligne', value: s['biens_valides'], icon: 'flash_on' },
      { label: 'En attente de validation', value: s['biens_en_attente'], icon: 'hourglass_top' },
      { label: 'Demandes à traiter', value: s['demandes_en_attente'], icon: 'inbox', link: '/dashboard/demandes-recues' },
      { label: 'Demandes (total)', value: s['demandes'], icon: 'event' },
      { label: 'Revenus encaissés', value: fcfa(s['revenus']), icon: 'paid', link: '/dashboard/transactions' },
    ];
    return [
      { label: 'Mes demandes', value: s['demandes'], icon: 'event', link: '/dashboard/mes-demandes' },
      { label: 'Demandes acceptées', value: s['demandes_acceptees'], icon: 'task_alt' },
      { label: 'Favoris', value: s['favoris'], icon: 'favorite', link: '/dashboard/favoris' },
      { label: 'Transactions', value: s['transactions'], icon: 'payments', link: '/dashboard/transactions' },
    ];
  });

  ngOnInit() {
    this.refresh();
    this.socket.live('demande:changed', 'transaction:changed', 'bien:changed', 'user:changed', 'message:new', 'notification:new').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refresh());
  }

  refresh() {
    this.api.stats().subscribe({
      next: d => {
        this.data.set(d);
        if (d.role === 'admin') this.api.adminBiens({ status_id: 1, limit: 5 }).subscribe({ next: r => this.pending.set(r.biens), error: () => {} });
      },
      error: e => this.error.set(errorMessage(e, 'Impossible de charger les statistiques')),
    });
  }
}
