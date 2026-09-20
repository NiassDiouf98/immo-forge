import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHost } from './shared/components/toast-host/toast-host';
import { SocketService } from './core/services/socket.service';
import { NotificationStore } from './core/services/notification.store';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastHost],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('immo-forge');

  // Instanciés au démarrage : connexion temps réel et notifications actives sur toutes les pages
  private readonly socket = inject(SocketService);
  private readonly notifications = inject(NotificationStore);
}
