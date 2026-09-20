import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationStore } from '../../../core/services/notification.store';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  auth = inject(AuthService);
  notifications = inject(NotificationStore);
  mobileMenuOpen = signal(false);
  scrolled = signal(false);

  links = [
    { label: 'Propriétés', to: '/properties' },
    { label: 'À propos', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 24);
  }

  toggleMobileMenu() { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu() { this.mobileMenuOpen.set(false); }

  /** « Publier un bien » : direct vers le formulaire pour un partenaire, inscription sinon. */
  get publishLink(): string {
    return this.auth.hasRole('partenaire') ? '/dashboard/create-property' : '/register';
  }

  get showPublish(): boolean {
    return !this.auth.isLoggedIn() || this.auth.hasRole('partenaire');
  }
}
