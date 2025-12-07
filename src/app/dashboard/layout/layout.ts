import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterLink, MatIconModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout {

  sidebarOpen = true;
    userMenuOpen = false;
    notifications = [
      { id:1, text: 'Nouvelle demande de visite - Villa Almadies', time:'2h' },
      { id:2, text: 'Paiement reçu - Appartement Plateau', time:'1j' }
    ];

    constructor(private router: Router) {}

    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
    logout() { /* appeler authService.logout() puis router.navigate */ }

}
