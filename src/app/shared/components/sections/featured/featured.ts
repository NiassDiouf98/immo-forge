import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../../../core/services/socket.service';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Bien } from '../../../../core/models/models';
import { PropertyCard } from '../../property-card/property-card';

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [ RouterLink, PropertyCard ],
  templateUrl: './featured.html',
  styleUrl: './featured.css',
})
export class Featured implements OnInit {
  private api = inject(ApiService);
  private socket = inject(SocketService);
  private destroyRef = inject(DestroyRef);

  properties = signal<Bien[]>([]);
  loading = signal(true);

  ngOnInit() {
    this.load();
    // un bien est publié / modifié / retiré : la vitrine se met à jour seule
    this.socket.live('catalogue:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  load() {
    this.api.biens({ limit: 3 }).subscribe({
      next: r => { this.properties.set(r.biens); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }
}
