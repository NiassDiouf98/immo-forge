import { Component, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Bien, Favori } from '../../core/models/models';
import { PropertyCard } from '../../shared/components/property-card/property-card';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-favoris',
  imports: [MatIconModule, RouterLink, PropertyCard],
  templateUrl: './favoris.html',
})
export class Favoris implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);

  favoris = signal<Favori[]>([]);
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.api.favoris().subscribe({
      next: f => { this.favoris.set(f.filter(x => x.bien)); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  remove(b: Bien) {
    this.api.removeFavori(b.id).subscribe({
      next: () => { this.favoris.update(l => l.filter(f => f.bien_id !== b.id)); this.toast.success('Retiré des favoris'); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
