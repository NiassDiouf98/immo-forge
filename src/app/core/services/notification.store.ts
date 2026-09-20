import { Injectable, computed, effect, inject, signal, untracked } from '@angular/core';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { ToastService } from './toast.service';
import { Notification } from '../models/models';

/** Notifications de l'utilisateur, partagées entre la navbar, le menu et la page dédiée, mises à jour en direct. */
@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private socket = inject(SocketService);
  private toast = inject(ToastService);

  readonly items = signal<Notification[]>([]);
  readonly unread = computed(() => this.items().filter(n => !n.est_lu).length);
  readonly loaded = signal(false);

  constructor() {
    // Charge les notifications à la connexion, vide le store à la déconnexion
    effect(() => {
      const user = this.auth.user();
      untracked(() => (user ? this.load() : (this.items.set([]), this.loaded.set(false))));
    });
    this.socket.on<Notification>('notification:new').subscribe(n => {
      this.items.update(list => (list.some(x => x.id === n.id) ? list : [n, ...list]));
      this.toast.info(`${n.titre} — ${n.contenu.length > 90 ? n.contenu.slice(0, 90) + '…' : n.contenu}`);
    });
    // Après une reconnexion, des événements ont pu être manqués : on recharge
    this.socket.on('__reconnected').subscribe(() => this.load());
  }

  load() {
    if (!this.auth.isLoggedIn()) return;
    this.api.notifications().subscribe({
      next: n => { this.items.set(n); this.loaded.set(true); },
      error: () => {},
    });
  }

  read(n: Notification) {
    if (n.est_lu) return;
    this.items.update(l => l.map(x => (x.id === n.id ? { ...x, est_lu: true } : x)));
    this.api.lireNotification(n.id).subscribe({ error: () => this.load() });
  }

  readAll() {
    this.items.update(l => l.map(x => ({ ...x, est_lu: true })));
    this.api.lireToutesNotifications().subscribe({ error: () => this.load() });
  }
}
