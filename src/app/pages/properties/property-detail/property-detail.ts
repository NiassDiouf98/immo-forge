import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SocketService } from '../../../core/services/socket.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Footer } from '../../../shared/components/footer/footer';
import { Navbar } from '../../../shared/components/navbar/navbar';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Bien } from '../../../core/models/models';
import { errorMessage, fullName } from '../../../utils/helpers';

@Component({
  selector: 'app-property-detail',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, Footer, Navbar],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private sanitizer = inject(DomSanitizer);
  private socket = inject(SocketService);
  private destroyRef = inject(DestroyRef);
  auth = inject(AuthService);
  fullName = fullName;

  /** Paramètre de route :id (withComponentInputBinding) */
  id = input.required<string>();

  bien = signal<Bien | null>(null);
  error = signal('');
  selectedImage = 0;
  mapUrl: SafeResourceUrl | null = null;
  isFavorite = signal(false);

  demandeMessage = '';
  messageText = '';
  sending = false;

  ngOnInit() {
    this.load();

    // cette fiche a été modifiée, retirée ou refusée pendant que le visiteur la consulte
    this.socket.on<{ id: number; action: string }>('catalogue:changed').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
      if (p?.id !== Number(this.id())) return;
      if (p.action === 'deleted') this.error.set("Ce bien n'est plus disponible");
      else this.load();
    });
  }

  private load() {
    this.api.bien(this.id()).subscribe({
      next: b => {
        this.bien.set(b);
        if (b.latitude && b.longitude) {
          const lat = +b.latitude, lng = +b.longitude, d = 0.008;
          const url = `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
          this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
        if (this.auth.isLoggedIn()) {
          this.api.favoris().subscribe({ next: f => this.isFavorite.set(f.some(x => x.bien_id === b.id)), error: () => {} });
        }
      },
      error: e => this.error.set(errorMessage(e, 'Bien introuvable')),
    });
  }

  img(path?: string) { return this.api.fileUrl(path); }
  get isOwner() { return this.bien()?.proprietaire_id === this.auth.user()?.id; }
  get isClient() { return this.auth.hasRole('client'); }

  tarif(type: 'location_mensuelle' | 'vente') {
    return this.bien()?.tarifs?.find(t => t.type_tarif === type);
  }

  private requireLogin(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
    return false;
  }

  toggleFavorite() {
    if (!this.requireLogin()) return;
    const b = this.bien()!;
    const call = this.isFavorite() ? this.api.removeFavori(b.id) : this.api.addFavori(b.id);
    call.subscribe({
      next: () => { this.isFavorite.update(v => !v); this.toast.success(this.isFavorite() ? 'Ajouté aux favoris' : 'Retiré des favoris'); },
      error: e => this.toast.error(errorMessage(e)),
    });
  }

  envoyerDemande() {
    if (!this.requireLogin()) return;
    this.sending = true;
    this.api.createDemande(this.bien()!.id, this.demandeMessage).subscribe({
      next: () => { this.sending = false; this.demandeMessage = ''; this.toast.success('Demande envoyée au propriétaire'); },
      error: e => { this.sending = false; this.toast.error(errorMessage(e)); },
    });
  }

  envoyerMessage() {
    if (!this.requireLogin() || !this.messageText.trim()) return;
    this.sending = true;
    this.api.sendMessage(this.bien()!.proprietaire_id, this.messageText).subscribe({
      next: () => { this.sending = false; this.messageText = ''; this.toast.success('Message envoyé'); },
      error: e => { this.sending = false; this.toast.error(errorMessage(e)); },
    });
  }

  /** Crée une transaction en attente puis ouvre l'écran de paiement. */
  reserver(type: 'location' | 'vente') {
    if (!this.requireLogin()) return;
    const b = this.bien()!;
    const montant = Number(this.tarif(type === 'location' ? 'location_mensuelle' : 'vente')?.montant ?? b.prix);
    this.sending = true;
    this.api.createTransaction(b.id, type, montant).subscribe({
      next: () => { this.sending = false; this.toast.success('Transaction créée : finalisez le paiement'); this.router.navigate(['/dashboard/transactions']); },
      error: e => { this.sending = false; this.toast.error(errorMessage(e)); },
    });
  }
}
