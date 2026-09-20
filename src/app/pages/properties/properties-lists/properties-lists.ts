import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { Footer } from '../../../shared/components/footer/footer';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { PropertyCard } from '../../../shared/components/property-card/property-card';
import { Pagination } from '../../../shared/components/pagination/pagination';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Bien, Pagination as Pag, Refs } from '../../../core/models/models';
import { errorMessage } from '../../../utils/helpers';

const EMPTY_FILTERS = { search: '', type_id: '', zone_id: '', prix_min: '', prix_max: '', chambres_min: '' };

@Component({
  selector: 'app-properties-lists',
  imports: [CommonModule, FormsModule, MatIconModule, Footer, Navbar, PropertyCard, Pagination],
  templateUrl: './properties-lists.html',
  styleUrl: './properties-lists.css',
})
export class PropertiesLists implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);
  private socket = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);

  refs: Refs = { zones: [], types: [], statuts: [] };
  filters = { ...EMPTY_FILTERS };
  biens = signal<Bien[]>([]);
  pagination = signal<Pag>({ total: 0, page: 1, limit: 9, totalPages: 1 });
  favoris = signal<Set<number>>(new Set());
  loading = signal(true);
  error = signal('');

  ngOnInit() {
    this.api.refs().subscribe({ next: r => (this.refs = r), error: () => {} });
    if (this.auth.isLoggedIn()) {
      this.api.favoris().subscribe({ next: f => this.favoris.set(new Set(f.map(x => x.bien_id))), error: () => {} });
    }
    // Les filtres vivent dans l'URL : lien partageable, retour arrière fonctionnel
    this.route.queryParams.subscribe(q => {
      this.filters = { ...EMPTY_FILTERS, ...Object.fromEntries(Object.keys(EMPTY_FILTERS).map(k => [k, q[k] ?? ''])) };
      this.load(Number(q['page']) || 1);
    });

    // catalogue modifié par un propriétaire ou un admin : la liste se rafraîchit sans clignoter
    this.socket.live('catalogue:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.load(this.pagination().page, true));
  }

  private load(page: number, silent = false) {
    if (!silent) this.loading.set(true);
    this.error.set('');
    this.api.biens({ ...this.filters, page, limit: 9 }).subscribe({
      next: r => { this.biens.set(r.biens); this.pagination.set(r.pagination); this.loading.set(false); },
      error: e => { this.error.set(errorMessage(e, 'Impossible de charger les biens')); this.loading.set(false); },
    });
  }

  applyFilters() {
    this.navigate(1);
  }

  resetFilters() {
    this.filters = { ...EMPTY_FILTERS };
    this.navigate(1);
  }

  goToPage(page: number) {
    this.navigate(page);
  }

  private navigate(page: number) {
    const queryParams: Record<string, string | number> = {};
    for (const [k, v] of Object.entries(this.filters)) if (v !== '' && v !== null) queryParams[k] = v as string;
    if (page > 1) queryParams['page'] = page;
    this.router.navigate([], { relativeTo: this.route, queryParams });
  }

  toggleFavorite(bien: Bien) {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }
    const isFav = this.favoris().has(bien.id);
    const call = isFav ? this.api.removeFavori(bien.id) : this.api.addFavori(bien.id);
    call.subscribe({
      next: () => {
        this.favoris.update(s => { const n = new Set(s); isFav ? n.delete(bien.id) : n.add(bien.id); return n; });
        this.toast.success(isFav ? 'Retiré des favoris' : 'Ajouté aux favoris');
      },
      error: e => this.toast.error(errorMessage(e)),
    });
  }
}
