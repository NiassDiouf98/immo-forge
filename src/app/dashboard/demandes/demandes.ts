import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Demande } from '../../core/models/models';
import { Badge } from '../../shared/components/badge/badge';
import { errorMessage, fullName } from '../../utils/helpers';

/** Écran partagé : « Demandes reçues » (propriétaire) et « Mes demandes » (client), selon data.mode de la route. */
@Component({
  selector: 'app-demandes',
  imports: [CommonModule, MatIconModule, RouterLink, Badge],
  templateUrl: './demandes.html',
})
export class Demandes implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);
  fullName = fullName;

  mode = input<'recues' | 'mes'>('mes');
  demandes = signal<Demande[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.load();
    this.socket.live('demande:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  load() {
    const call = this.mode() === 'recues' ? this.api.demandesRecues() : this.api.mesDemandes();
    call.subscribe({
      next: d => { this.demandes.set(d); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  img(d: Demande) { return this.api.fileUrl(d.bien?.images?.[0]?.url_image); }

  decide(d: Demande, statut: 'acceptee' | 'refusee') {
    this.api.updateDemande(d.id, statut).subscribe({
      next: () => {
        this.demandes.update(list => list.map(x => (x.id === d.id ? { ...x, statut } : x)));
        this.toast.success(statut === 'acceptee' ? 'Demande acceptée' : 'Demande refusée');
      },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
