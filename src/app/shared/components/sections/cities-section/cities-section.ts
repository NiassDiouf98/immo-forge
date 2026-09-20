import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../../../core/services/socket.service';
import { Router } from '@angular/router';
import { forkJoin, map, of, switchMap } from 'rxjs';
import { ApiService } from '../../../../core/services/api.service';

interface City {
  id: number | null;
  name: string;
  image: string;
  properties: number;
}

@Component({
  selector: 'app-cities-section',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './cities-section.html',
  styleUrl: './cities-section.css',
})
export class CitiesSection implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private socket = inject(SocketService);
  private destroyRef = inject(DestroyRef);

  cities = signal<City[]>([
    { id: null, name: 'Dakar', properties: 0, image: '/assets/cities/dk-ville.jpeg' },
    { id: null, name: 'Thiès', properties: 0, image: '/assets/cities/th-ville.jpeg' },
    { id: null, name: 'Saint-Louis', properties: 0, image: '/assets/cities/sl-ville.jpeg' },
    { id: null, name: 'Ziguinchor', properties: 0, image: '/assets/cities/zg-ville.jpeg' },
  ]);

  ngOnInit() {
    this.load();
    this.socket.live('catalogue:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load());
  }

  load() {
    // Nombre réel de biens validés par région
    this.api.refs().pipe(
      switchMap(refs => {
        const base = this.cities().map(c => ({ ...c, id: refs.zones.find(z => z.nom === c.name)?.id ?? null }));
        return forkJoin(base.map(c =>
          c.id ? this.api.biens({ zone_id: c.id, limit: 1 }).pipe(map(r => ({ ...c, properties: r.pagination.total }))) : of(c),
        ));
      }),
    ).subscribe({ next: c => this.cities.set(c), error: () => {} });
  }

  goToCity(city: City) {
    this.router.navigate(['/properties'], { queryParams: city.id ? { zone_id: city.id } : {} });
  }
}
