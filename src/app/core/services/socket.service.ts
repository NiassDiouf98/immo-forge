import { Injectable, PLATFORM_ID, effect, inject, signal, untracked } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, Subject, debounceTime, filter, merge } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

/**
 * Connexion temps réel unique (Socket.IO) : se connecte à la connexion de l'utilisateur,
 * se coupe à la déconnexion et expose les événements du serveur sous forme d'Observables.
 */
@Injectable({ providedIn: 'root' })
export class SocketService {
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private socket?: Socket;
  private hasConnectedOnce = false;
  private streams = new Map<string, Subject<unknown>>();

  /** true quand la connexion temps réel est établie */
  readonly connected = signal(false);

  constructor() {
    if (!this.isBrowser) return;
    // Connecté en permanence : anonyme pour un visiteur (événements publics), authentifié après connexion.
    // À chaque changement de session on se reconnecte pour appliquer le bon jeton.
    effect(() => {
      this.auth.user();
      untracked(() => { this.disconnect(); this.connect(); });
    });
  }

  /** Flux d'un événement serveur */
  on<T = unknown>(event: string): Observable<T> {
    let s = this.streams.get(event);
    if (!s) { s = new Subject<unknown>(); this.streams.set(event, s); }
    return s.asObservable() as Observable<T>;
  }

  /** Émet une notification « quelque chose a changé » (regroupée) pour plusieurs événements */
  live(...events: string[]): Observable<unknown> {
    // '__reconnected' : rechargement aussi après une coupure réseau
    return merge(...[...events, '__reconnected'].map(e => this.on(e))).pipe(debounceTime(250));
  }

  emit(event: string, payload?: unknown) {
    this.socket?.emit(event, payload);
  }

  /** Demande quels utilisateurs sont en ligne et s'abonne à leurs changements de présence */
  async watchPresence(ids: number[]): Promise<number[]> {
    const socket = this.socket;
    if (!socket || ids.length === 0) return [];
    // La connexion peut ne pas être encore établie (chargement de page) : on l'attend au plus 5 s
    if (!socket.connected) {
      await new Promise<void>(resolve => {
        const timer = setTimeout(resolve, 5000);
        socket.once('connect', () => { clearTimeout(timer); resolve(); });
      });
    }
    if (!socket.connected) return [];
    return new Promise(resolve => socket.emit('presence:watch', ids, (online: number[]) => resolve(online ?? [])));
  }

  private connect() {
    if (this.socket) return;

    // auth en fonction : le jeton (absent pour un visiteur) est relu à chaque (re)connexion
    this.socket = io(environment.socketUrl || undefined, {
      auth: cb => cb(this.auth.token ? { token: this.auth.token } : {}),
      transports: ['websocket', 'polling'],
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      // 1re connexion = état initial ; les suivantes = reprise après coupure → les écrans rechargent leurs données
      if (this.hasConnectedOnce) this.streams.get('__reconnected')?.next(true);
      this.hasConnectedOnce = true;
      this.connected.set(true);
    });
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('connect_error', err => {
      // Jeton refusé (expiré, compte suspendu) : la session est fermée, la reconnexion se refait en visiteur
      if (err.message === 'Token invalide' || err.message === 'Compte inactif') {
        if (this.auth.isLoggedIn()) this.auth.logout(); else this.disconnect();
      }
    });

    // Tous les événements serveur sont redistribués aux Observables
    this.socket.onAny((event: string, payload: unknown) => this.streams.get(event)?.next(payload));

    // Réactions globales
    this.on<{ reason?: string }>('session:revoked').subscribe(p => {
      this.toast.error(p?.reason ?? 'Votre session a été fermée.');
      this.auth.logout();
    });
    this.on<{ id: number; role?: string }>('user:changed')
      .pipe(filter(p => p?.id === this.auth.user()?.id))
      .subscribe(p => {
        // rôle ou statut modifié par un admin : on relit le profil
        const before = this.auth.role();
        this.auth.refreshProfile().subscribe({
          next: () => {
            if (this.auth.role() !== before) {
              this.toast.info('Votre rôle a été modifié.');
              this.router.navigate(['/dashboard']);
            }
          },
          error: () => {},
        });
      });
  }

  private disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = undefined;
    this.hasConnectedOnce = false;
    this.connected.set(false);
  }
}
