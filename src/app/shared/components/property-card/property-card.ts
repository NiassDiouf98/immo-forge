import { Component, computed, inject, input, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Bien } from '../../../core/models/models';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-property-card',
  host: { class: 'relative block h-full' },
  imports: [DecimalPipe, RouterLink, MatIconModule],
  template: `
    <article class="card card-hover group flex h-full flex-col overflow-hidden">
      <a [routerLink]="['/property', bien().id]" class="relative block aspect-[4/3] overflow-hidden bg-gray-100" [attr.aria-label]="bien().titre">
        <img [src]="image()" [alt]="bien().titre" loading="lazy"
             class="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

        @if (bien().type) {
          <span class="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-primary shadow-sm">{{ bien().type?.nom }}</span>
        }
        <div class="absolute bottom-4 left-4 right-4 text-white">
          <div class="text-xl font-semibold leading-tight drop-shadow">
            {{ price() | number }} <span class="text-sm font-medium">FCFA{{ isLocation() ? ' / mois' : '' }}</span>
          </div>
        </div>
      </a>

      @if (favoriteToggle()) {
        <button (click)="toggleFavorite.emit(bien())" type="button"
                [attr.aria-label]="isFavorite() ? 'Retirer des favoris' : 'Ajouter aux favoris'" [attr.aria-pressed]="isFavorite()"
                class="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow transition hover:scale-110">
          <mat-icon [class.text-red-500]="isFavorite()" class="!text-[22px]">{{ isFavorite() ? 'favorite' : 'favorite_border' }}</mat-icon>
        </button>
      }

      <div class="flex flex-1 flex-col p-5">
        <h3 class="line-clamp-2 text-lg font-semibold leading-snug text-charcoal">{{ bien().titre }}</h3>
        <p class="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
          <mat-icon class="!h-[18px] !w-[18px] !text-[18px] text-secondary-dark">location_on</mat-icon>
          <span class="truncate">{{ bien().zone?.nom }}{{ bien().adresse ? ', ' + bien().adresse : '' }}</span>
        </p>

        <div class="mt-4 flex items-center gap-5 border-t border-gray-100 pt-4 text-sm text-gray-600">
          <span class="flex items-center gap-1.5" title="Chambres"><mat-icon class="!h-[18px] !w-[18px] !text-[18px] text-gray-400">bed</mat-icon>{{ bien().chambres ?? 0 }}</span>
          <span class="flex items-center gap-1.5" title="Salles d'eau"><mat-icon class="!h-[18px] !w-[18px] !text-[18px] text-gray-400">bathtub</mat-icon>{{ bien().salles_bain ?? 0 }}</span>
          <span class="flex items-center gap-1.5" title="Surface"><mat-icon class="!h-[18px] !w-[18px] !text-[18px] text-gray-400">square_foot</mat-icon>{{ bien().surface ? (+bien().surface! | number:'1.0-0') : '—' }} m²</span>
        </div>
      </div>
    </article>
  `,
})
export class PropertyCard {
  private api = inject(ApiService);

  bien = input.required<Bien>();
  favoriteToggle = input(false);
  isFavorite = input(false);
  toggleFavorite = output<Bien>();

  image = computed(() => this.api.fileUrl(this.bien().images?.[0]?.url_image));
  private loyer = computed(() => this.bien().tarifs?.find(t => t.type_tarif === 'location_mensuelle'));
  isLocation = computed(() => !!this.loyer() && !this.bien().tarifs?.some(t => t.type_tarif === 'vente'));
  price = computed(() => Number(this.isLocation() ? this.loyer()!.montant : this.bien().prix ?? 0));
}
