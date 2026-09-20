import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { ApiService, BienPayload } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';
import { Refs } from '../../core/models/models';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-property-form',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink],
  templateUrl: './property-form.html',
  styleUrl: './property-form.css',
})
export class PropertyForm implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);

  /** Présent seulement sur /dashboard/edit-property/:id */
  id = input<string>();

  refs: Refs = { zones: [], types: [], statuts: [] };
  model = {
    titre: '', description: '', type_id: '', zone_id: '', adresse: '',
    latitude: '', longitude: '', prix: '', chambres: 1, salles_bain: 1, surface: '',
    loyer: '',
  };
  /** URLs déjà enregistrées (édition) */
  existingImages = signal<string[]>([]);
  newFiles: File[] = [];
  newPreviews = signal<string[]>([]);

  loading = false;
  loadingData = signal(false);
  error = '';

  get isEdit() { return !!this.id(); }

  ngOnInit() {
    this.api.refs().subscribe({ next: r => (this.refs = r), error: () => {} });
    if (this.id()) {
      this.loadingData.set(true);
      this.api.bien(this.id()!).subscribe({
        next: b => {
          this.model = {
            titre: b.titre, description: b.description ?? '', type_id: String(b.type_id), zone_id: String(b.zone_id ?? ''),
            adresse: b.adresse ?? '', latitude: b.latitude ?? '', longitude: b.longitude ?? '', prix: b.prix ?? '',
            chambres: b.chambres ?? 0, salles_bain: b.salles_bain ?? 0, surface: b.surface ?? '',
            loyer: String(b.tarifs?.find(t => t.type_tarif === 'location_mensuelle')?.montant ?? ''),
          };
          this.existingImages.set((b.images ?? []).map(i => i.url_image));
          this.loadingData.set(false);
        },
        error: e => { this.error = errorMessage(e, 'Bien introuvable'); this.loadingData.set(false); },
      });
    }
  }

  img(u: string) { return this.api.fileUrl(u); }

  onFilesSelected(evt: Event) {
    const files = Array.from((evt.target as HTMLInputElement).files ?? []);
    for (const f of files) {
      this.newFiles.push(f);
      const reader = new FileReader();
      reader.onload = e => this.newPreviews.update(p => [...p, String(e.target?.result)]);
      reader.readAsDataURL(f);
    }
    (evt.target as HTMLInputElement).value = '';
  }

  removeExisting(i: number) { this.existingImages.update(a => a.filter((_, idx) => idx !== i)); }
  removeNew(i: number) {
    this.newFiles.splice(i, 1);
    this.newPreviews.update(a => a.filter((_, idx) => idx !== i));
  }

  submit() {
    const m = this.model;
    if (!m.titre.trim() || !m.type_id || !m.zone_id || !m.prix) {
      this.error = 'Titre, type, région et prix sont obligatoires';
      return;
    }
    this.loading = true;
    this.error = '';

    const upload$ = this.newFiles.length ? this.api.uploadImages(this.newFiles) : null;
    const go = (uploaded: string[]) => {
      const tarifs: BienPayload['tarifs'] = [{ type_tarif: 'vente', montant: +m.prix }];
      if (m.loyer) tarifs.push({ type_tarif: 'location_mensuelle', montant: +m.loyer });
      const payload: BienPayload = {
        titre: m.titre.trim(), description: m.description, type_id: +m.type_id, zone_id: +m.zone_id, adresse: m.adresse,
        latitude: m.latitude ? +m.latitude : null, longitude: m.longitude ? +m.longitude : null,
        prix: +m.prix, chambres: +m.chambres, salles_bain: +m.salles_bain, surface: m.surface ? +m.surface : undefined,
        tarifs, images: [...this.existingImages(), ...uploaded],
      };
      const save$ = this.isEdit ? this.api.updateBien(+this.id()!, payload) : this.api.createBien(payload);
      save$.subscribe({
        next: () => {
          this.toast.success(this.isEdit ? 'Bien mis à jour — il repasse en validation' : 'Bien créé — en attente de validation par un administrateur');
          this.router.navigate(['/dashboard/properties']);
        },
        error: e => { this.loading = false; this.error = errorMessage(e); },
      });
    };

    if (upload$) upload$.subscribe({ next: go, error: e => { this.loading = false; this.error = errorMessage(e, "Échec de l'envoi des images"); } });
    else go([]);
  }
}
