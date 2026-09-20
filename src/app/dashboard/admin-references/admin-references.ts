import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../core/services/socket.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Ref } from '../../core/models/models';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-admin-references',
  imports: [FormsModule, MatIconModule],
  templateUrl: './admin-references.html',
})
export class AdminReferences implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);
  private socket = inject(SocketService);

  types = signal<Ref[]>([]);
  zones = signal<Ref[]>([]);
  loading = signal(true);
  newType = '';
  editingId: number | null = null;
  editingName = '';

  ngOnInit() {
    this.load();
    this.socket.live('refs:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  load() {
    this.api.refs().subscribe({
      next: r => { this.types.set(r.types); this.zones.set(r.zones); this.loading.set(false); },
      error: e => { this.toast.error(errorMessage(e)); this.loading.set(false); },
    });
  }

  add() {
    if (!this.newType.trim()) return;
    this.api.createType(this.newType.trim()).subscribe({
      next: () => { this.newType = ''; this.toast.success('Type ajouté'); this.load(); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  edit(t: Ref) { this.editingId = t.id; this.editingName = t.nom; }

  save(t: Ref) {
    this.api.updateType(t.id, this.editingName).subscribe({
      next: () => { this.editingId = null; this.toast.success('Type renommé'); this.load(); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  remove(t: Ref) {
    if (!confirm(`Supprimer le type « ${t.nom} » ?`)) return;
    this.api.deleteType(t.id).subscribe({
      next: () => { this.toast.success('Type supprimé'); this.load(); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
