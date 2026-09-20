import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { RoleName } from '../../core/models/models';
import { NotificationStore } from '../../core/services/notification.store';
import { SocketService } from '../../core/services/socket.service';

interface MenuItem { label: string; icon: string; link: string; roles: RoleName[]; exact?: boolean; group: 'main' | 'manage' | 'account'; }

const MENU: MenuItem[] = [
  { label: 'Tableau de bord', icon: 'space_dashboard', link: '/dashboard', roles: ['admin', 'partenaire', 'client'], exact: true, group: 'main' },
  { label: 'Mes biens', icon: 'home_work', link: '/dashboard/properties', roles: ['partenaire'], group: 'manage' },
  { label: 'Ajouter un bien', icon: 'add_home', link: '/dashboard/create-property', roles: ['partenaire'], group: 'manage' },
  { label: 'Demandes reçues', icon: 'inbox', link: '/dashboard/demandes-recues', roles: ['partenaire'], group: 'manage' },
  { label: 'Mes demandes', icon: 'event_available', link: '/dashboard/mes-demandes', roles: ['client'], group: 'manage' },
  { label: 'Favoris', icon: 'favorite', link: '/dashboard/favoris', roles: ['client'], group: 'manage' },
  { label: 'Modération des biens', icon: 'fact_check', link: '/dashboard/admin/biens', roles: ['admin'], group: 'manage' },
  { label: 'Utilisateurs', icon: 'group', link: '/dashboard/admin/users', roles: ['admin'], group: 'manage' },
  { label: 'Demandes', icon: 'inbox', link: '/dashboard/admin/demandes', roles: ['admin'], group: 'manage' },
  { label: 'Transactions', icon: 'account_balance', link: '/dashboard/admin/transactions', roles: ['admin'], group: 'manage' },
  { label: 'Référentiels', icon: 'tune', link: '/dashboard/admin/references', roles: ['admin'], group: 'manage' },
  { label: 'Transactions', icon: 'payments', link: '/dashboard/transactions', roles: ['client', 'partenaire'], group: 'manage' },
  { label: 'Messages', icon: 'chat_bubble', link: '/dashboard/messages', roles: ['admin', 'partenaire', 'client'], group: 'account' },
  { label: 'Notifications', icon: 'notifications', link: '/dashboard/notifications', roles: ['admin', 'partenaire', 'client'], group: 'account' },
  { label: 'Mon profil', icon: 'manage_accounts', link: '/dashboard/profile', roles: ['admin', 'partenaire', 'client'], group: 'account' },
];

const ROLE_LABEL: Record<RoleName, string> = { admin: 'Administrateur', partenaire: 'Propriétaire', client: 'Client' };

@Component({
  selector: 'app-layout',
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, MatIconModule, RouterOutlet],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class Layout implements OnInit {
  private router = inject(Router);
  auth = inject(AuthService);
  store = inject(NotificationStore);
  socket = inject(SocketService);

  /** Tiroir du menu sur mobile */
  drawerOpen = signal(false);
  notifOpen = signal(false);
  userMenuOpen = signal(false);
  search = '';

  visible = computed(() => MENU.filter(m => this.auth.role() && m.roles.includes(this.auth.role()!)));
  groups = computed(() => {
    const v = this.visible();
    return [
      { title: '', items: v.filter(m => m.group === 'main') },
      { title: 'Gestion', items: v.filter(m => m.group === 'manage') },
      { title: 'Compte', items: v.filter(m => m.group === 'account') },
    ].filter(g => g.items.length);
  });
  roleLabel = computed(() => (this.auth.role() ? ROLE_LABEL[this.auth.role()!] : ''));

  ngOnInit() {
    // Valide le token stocké et rafraîchit le profil
    this.auth.refreshProfile().subscribe({ error: () => {} });
    // Ferme tiroir et menus à chaque navigation
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.drawerOpen.set(false); this.notifOpen.set(false); this.userMenuOpen.set(false);
    });
  }

  toggleNotifs() {
    this.userMenuOpen.set(false);
    this.notifOpen.update(v => !v);
    if (this.notifOpen()) this.store.load();
  }

  toggleUserMenu() {
    this.notifOpen.set(false);
    this.userMenuOpen.update(v => !v);
  }

  doSearch() {
    this.router.navigate(['/properties'], { queryParams: this.search.trim() ? { search: this.search.trim() } : {} });
  }

  logout() { this.auth.logout(); }
}
