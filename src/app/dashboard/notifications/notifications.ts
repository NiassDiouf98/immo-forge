import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NotificationStore } from '../../core/services/notification.store';

@Component({
  selector: 'app-notifications',
  imports: [CommonModule, MatIconModule],
  templateUrl: './notifications.html',
})
export class Notifications implements OnInit {
  store = inject(NotificationStore);

  ngOnInit() { this.store.load(); }
}
