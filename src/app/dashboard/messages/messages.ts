import { CommonModule } from '@angular/common';
import { AfterViewChecked, Component, DestroyRef, ElementRef, ViewChild, computed, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';
import { ToastService } from '../../core/services/toast.service';
import { Message } from '../../core/models/models';
import { errorMessage, fullName } from '../../utils/helpers';

interface Conversation { userId: number; name: string; last: Message; messages: Message[]; }

@Component({
  selector: 'app-messages',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './messages.html',
})
export class Messages implements OnInit, AfterViewChecked {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private socket = inject(SocketService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  @ViewChild('thread') thread?: ElementRef<HTMLElement>;

  all = signal<Message[]>([]);
  selectedId = signal<number | null>(null);
  loading = signal(true);
  error = signal('');
  draft = '';
  sending = false;

  /** ids des interlocuteurs actuellement en ligne */
  online = signal<Set<number>>(new Set());
  /** interlocuteurs en train d'écrire */
  typing = signal<Set<number>>(new Set());

  private typingTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private lastTypingSent = 0;
  private stickToBottom = true;
  private watched = new Set<number>();

  private me = computed(() => this.auth.user()!.id);

  conversations = computed<Conversation[]>(() => {
    const map = new Map<number, Conversation>();
    const sorted = [...this.all()].sort((a, b) => +new Date(a.date_message) - +new Date(b.date_message));
    for (const m of sorted) {
      const other = m.expediteur_id === this.me() ? m.destinataire : m.expediteur;
      const userId = m.expediteur_id === this.me() ? m.destinataire_id : m.expediteur_id;
      const conv = map.get(userId) ?? { userId, name: fullName(other), last: m, messages: [] };
      conv.messages.push(m);
      conv.last = m;
      map.set(userId, conv);
    }
    return [...map.values()].sort((a, b) => +new Date(b.last.date_message) - +new Date(a.last.date_message));
  });

  current = computed(() => this.conversations().find(c => c.userId === this.selectedId()) ?? null);
  myId = () => this.me();
  isOnline = (id: number) => this.online().has(id);
  isTyping = (id: number) => this.typing().has(id);

  ngOnInit() {
    this.load(true);

    // Nouveau message (reçu ou envoyé depuis un autre onglet)
    this.socket.on<Message>('message:new').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(m => {
      if (this.all().some(x => x.id === m.id)) return;
      this.all.update(list => [...list, m]);
      const partner = m.expediteur_id === this.me() ? m.destinataire_id : m.expediteur_id;
      this.clearTyping(partner);
      this.watch([partner]);
      if (!this.selectedId()) this.selectedId.set(partner);
      if (m.expediteur_id !== this.me() && this.selectedId() !== partner) this.toast.info('Nouveau message');
    });

    // « … écrit »
    this.socket.on<{ from: number; typing: boolean }>('typing').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p => {
      if (!p.typing) return this.clearTyping(p.from);
      this.typing.update(s => new Set(s).add(p.from));
      clearTimeout(this.typingTimers.get(p.from));
      // filet de sécurité si le « stop » est perdu
      this.typingTimers.set(p.from, setTimeout(() => this.clearTyping(p.from), 4000));
    });

    // Présence en ligne / hors ligne
    this.socket.on<{ userId: number; online: boolean }>('presence:update').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(p =>
      this.online.update(s => { const n = new Set(s); p.online ? n.add(p.userId) : n.delete(p.userId); return n; }),
    );

    // Reprise après coupure réseau : on recharge et on se réabonne
    this.socket.on('__reconnected').pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => { this.watched.clear(); this.load(false); });
  }

  ngAfterViewChecked() {
    const el = this.thread?.nativeElement;
    if (el && this.stickToBottom) el.scrollTop = el.scrollHeight;
  }

  onScroll() {
    const el = this.thread?.nativeElement;
    if (el) this.stickToBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  }

  select(id: number) {
    this.selectedId.set(id);
    this.stickToBottom = true;
  }

  load(selectFirst = false) {
    forkJoin([this.api.messages('recus'), this.api.messages('envoyes')]).subscribe({
      next: ([r, e]) => {
        this.all.set([...r, ...e]);
        if (selectFirst && this.conversations().length) this.selectedId.set(this.conversations()[0].userId);
        this.watch(this.conversations().map(c => c.userId));
        this.loading.set(false);
      },
      error: e => { this.error.set(errorMessage(e)); this.loading.set(false); },
    });
  }

  private async watch(ids: number[]) {
    const fresh = ids.filter(id => !this.watched.has(id));
    if (!fresh.length) return;
    fresh.forEach(id => this.watched.add(id));
    const online = await this.socket.watchPresence(fresh);
    this.online.update(s => new Set([...s, ...online]));
  }

  private clearTyping(id: number) {
    clearTimeout(this.typingTimers.get(id));
    this.typing.update(s => { const n = new Set(s); n.delete(id); return n; });
  }

  /** Prévient l'interlocuteur qu'on écrit (au plus une fois toutes les 2 s) */
  onDraftChange() {
    const c = this.current();
    if (!c) return;
    const now = Date.now();
    if (this.draft.trim() && now - this.lastTypingSent > 2000) {
      this.lastTypingSent = now;
      this.socket.emit('typing', { to: c.userId, typing: true });
    }
    if (!this.draft.trim()) this.socket.emit('typing', { to: c.userId, typing: false });
  }

  send() {
    const c = this.current();
    if (!c || !this.draft.trim()) return;
    this.sending = true;
    this.socket.emit('typing', { to: c.userId, typing: false });
    this.api.sendMessage(c.userId, this.draft.trim()).subscribe({
      next: () => { this.sending = false; this.draft = ''; this.lastTypingSent = 0; this.stickToBottom = true; },
      error: e => { this.sending = false; this.toast.error(errorMessage(e)); },
    });
  }
}
