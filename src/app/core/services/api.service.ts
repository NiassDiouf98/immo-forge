import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from './socket.service';
import {
  Bien, Demande, Favori, Ref, Message, Notification, Pagination, Refs, Stats, Tarif, Transaction, User,
} from '../models/models';

/** Vignette neutre pour les biens sans photo (SVG intégré, aucune requête réseau). */
const NO_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#ECECE8"/>' +
      '<g fill="none" stroke="#B8B8B0" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M140 170l60-50 60 50v50h-120z"/><path d="M182 220v-32h36v32"/></g></svg>',
  );

type Params = Record<string, string | number | undefined | null>;

const clean = (p: Params = {}) => {
  let hp = new HttpParams();
  for (const [k, v] of Object.entries(p)) if (v !== undefined && v !== null && v !== '') hp = hp.set(k, String(v));
  return hp;
};

export interface BienPayload {
  titre: string;
  description?: string;
  type_id: number;
  zone_id: number;
  adresse?: string;
  latitude?: number | null;
  longitude?: number | null;
  prix: number;
  chambres?: number;
  salles_bain?: number;
  surface?: number;
  tarifs?: Pick<Tarif, 'type_tarif' | 'montant'>[];
  images?: string[];
}

/** Point d'entrée unique vers l'API REST ImmoForge. */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;
  private refs$?: Observable<Refs>;

  constructor() {
    // un admin a modifié les types de biens : on oublie le cache
    inject(SocketService).on('refs:changed').subscribe(() => (this.refs$ = undefined));
  }

  /** Transforme une URL d'image stockée en URL affichable. */
  fileUrl(path?: string | null): string {
    if (!path) return NO_IMAGE;
    return path.startsWith('/uploads') ? environment.filesUrl + path : path;
  }

  // ---- Référentiels
  refs(): Observable<Refs> {
    return (this.refs$ ??= this.http.get<{ data: Refs }>(`${this.base}/refs`).pipe(map(r => r.data), shareReplay(1)));
  }

  // ---- Biens
  biens(params: Params = {}) {
    return this.http.get<{ data: { biens: Bien[]; pagination: Pagination } }>(`${this.base}/biens`, { params: clean(params) }).pipe(map(r => r.data));
  }
  bien(id: number | string) {
    return this.http.get<{ data: { bien: Bien } }>(`${this.base}/biens/${id}`).pipe(map(r => r.data.bien));
  }
  mesBiens(params: Params = {}) {
    return this.http.get<{ data: { biens: Bien[]; pagination: Pagination } }>(`${this.base}/biens/mes-biens`, { params: clean(params) }).pipe(map(r => r.data));
  }
  adminBiens(params: Params = {}) {
    return this.http.get<{ data: { biens: Bien[]; pagination: Pagination } }>(`${this.base}/biens/admin/tous`, { params: clean(params) }).pipe(map(r => r.data));
  }
  createBien(p: BienPayload) {
    return this.http.post<{ data: { bien: Bien } }>(`${this.base}/biens`, p).pipe(map(r => r.data.bien));
  }
  updateBien(id: number, p: Partial<BienPayload>) {
    return this.http.put<{ data: { bien: Bien } }>(`${this.base}/biens/${id}`, p).pipe(map(r => r.data.bien));
  }
  deleteBien(id: number) {
    return this.http.delete(`${this.base}/biens/${id}`);
  }
  validerBien(id: number, action: 'valider' | 'refuser', raison_refus?: string) {
    return this.http.put(`${this.base}/biens/${id}/valider`, { action, raison_refus });
  }
  uploadImages(files: File[]) {
    const fd = new FormData();
    files.forEach(f => fd.append('images', f));
    return this.http.post<{ data: { urls: string[] } }>(`${this.base}/biens/images-bien`, fd).pipe(map(r => r.data.urls));
  }

  // ---- Demandes
  mesDemandes() {
    return this.http.get<{ data: { demandes: Demande[] } }>(`${this.base}/demandes/mes-demandes`).pipe(map(r => r.data.demandes));
  }
  demandesRecues() {
    return this.http.get<{ data: { demandes: Demande[] } }>(`${this.base}/demandes/pour-mes-biens`).pipe(map(r => r.data.demandes));
  }
  createDemande(bien_id: number, message: string) {
    return this.http.post<{ data: { demande: Demande } }>(`${this.base}/demandes`, { bien_id, message }).pipe(map(r => r.data.demande));
  }
  updateDemande(id: number, statut: 'acceptee' | 'refusee') {
    return this.http.put(`${this.base}/demandes/${id}/statut`, { statut });
  }

  // ---- Favoris
  favoris() {
    return this.http.get<{ data: { favoris: Favori[] } }>(`${this.base}/favoris`).pipe(map(r => r.data.favoris));
  }
  addFavori(bien_id: number) {
    return this.http.post(`${this.base}/favoris`, { bien_id });
  }
  removeFavori(bien_id: number) {
    return this.http.delete(`${this.base}/favoris/${bien_id}`);
  }

  // ---- Transactions
  transactions() {
    return this.http.get<{ data: { transactions: Transaction[] } }>(`${this.base}/transactions`).pipe(map(r => r.data.transactions));
  }
  createTransaction(bien_id: number, type_transaction: 'location' | 'vente', montant?: number) {
    return this.http.post<{ data: { transaction: Transaction } }>(`${this.base}/transactions`, { bien_id, type_transaction, montant }).pipe(map(r => r.data.transaction));
  }
  payerTransaction(id: number, mode_paiement: string) {
    return this.http.put(`${this.base}/transactions/${id}/payer`, { mode_paiement });
  }
  annulerTransaction(id: number) {
    return this.http.put(`${this.base}/transactions/${id}/annuler`, {});
  }

  // ---- Messages
  messages(type: 'recus' | 'envoyes') {
    return this.http.get<{ data: { messages: Message[] } }>(`${this.base}/messages`, { params: { type } }).pipe(map(r => r.data.messages));
  }
  sendMessage(destinataire_id: number, contenu: string) {
    return this.http.post(`${this.base}/messages`, { destinataire_id, contenu });
  }

  // ---- Notifications
  notifications() {
    return this.http.get<{ data: { notifications: Notification[] } }>(`${this.base}/notifications`).pipe(map(r => r.data.notifications));
  }
  lireNotification(id: number) {
    return this.http.put(`${this.base}/notifications/${id}/lire`, {});
  }
  lireToutesNotifications() {
    return this.http.put(`${this.base}/notifications/lire-tout`, {});
  }

  // ---- Contact public
  contact(payload: { name: string; email: string; phone?: string; message: string }) {
    return this.http.post<{ message: string }>(`${this.base}/contact`, payload);
  }

  // ---- Administration
  adminDemandes(params: Params = {}) {
    return this.http.get<{ data: { demandes: Demande[]; pagination: Pagination } }>(`${this.base}/admin/demandes`, { params: clean(params) }).pipe(map(r => r.data));
  }
  adminTransactions(params: Params = {}) {
    return this.http.get<{ data: { transactions: Transaction[]; revenus: number; pagination: Pagination } }>(`${this.base}/admin/transactions`, { params: clean(params) }).pipe(map(r => r.data));
  }
  setUserRole(id: number, role_nom: string) {
    return this.http.put(`${this.base}/admin/users/${id}/role`, { role_nom });
  }
  createType(nom: string) {
    this.refs$ = undefined;
    return this.http.post<{ data: { item: Ref } }>(`${this.base}/admin/types`, { nom }).pipe(map(r => r.data.item));
  }
  updateType(id: number, nom: string) {
    this.refs$ = undefined;
    return this.http.put<{ data: { item: Ref } }>(`${this.base}/admin/types/${id}`, { nom }).pipe(map(r => r.data.item));
  }
  deleteType(id: number) {
    this.refs$ = undefined;
    return this.http.delete(`${this.base}/admin/types/${id}`);
  }

  // ---- Stats & admin
  stats() {
    return this.http.get<{ data: Stats }>(`${this.base}/stats`).pipe(map(r => r.data));
  }
  users(params: Params = {}) {
    return this.http.get<{ data: { users: User[]; pagination: Pagination } }>(`${this.base}/users`, { params: clean(params) }).pipe(map(r => r.data));
  }
  updateUserStatut(id: number, statut: User['statut']) {
    return this.http.put(`${this.base}/users/${id}/statut`, { statut });
  }
}
