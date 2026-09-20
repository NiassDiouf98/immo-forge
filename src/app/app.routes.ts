import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages publiques
  { path: 'home', component: Home },
  { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
  { path: 'contact', loadComponent: () => import('./pages/contact/contact').then(m => m.Contact) },
  { path: 'properties', loadComponent: () => import('./pages/properties/properties-lists/properties-lists').then(m => m.PropertiesLists) },
  { path: 'property', redirectTo: 'properties', pathMatch: 'full' },
  { path: 'property/:id', loadComponent: () => import('./pages/properties/property-detail/property-detail').then(m => m.PropertyDetail) },

  // Authentification
  { path: 'login', loadComponent: () => import('./pages/auth/login/login').then(m => m.Login), canActivate: [guestGuard] },
  { path: 'register', loadComponent: () => import('./pages/auth/register/register').then(m => m.Register), canActivate: [guestGuard] },
  { path: 'forgot-password', loadComponent: () => import('./pages/auth/forgot-password/forgot-password').then(m => m.ForgotPassword), canActivate: [guestGuard] },
  { path: 'profile', redirectTo: 'dashboard/profile', pathMatch: 'full' },

  // Espace connecté (admin / partenaire / client)
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/layout/layout').then(m => m.Layout),
    canActivate: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./dashboard/overview/overview').then(m => m.Overview) },
      { path: 'properties', loadComponent: () => import('./dashboard/my-properties/my-properties').then(m => m.MyProperties), canActivate: [roleGuard('partenaire')] },
      { path: 'create-property', loadComponent: () => import('./dashboard/property-form/property-form').then(m => m.PropertyForm), canActivate: [roleGuard('partenaire')] },
      { path: 'edit-property/:id', loadComponent: () => import('./dashboard/property-form/property-form').then(m => m.PropertyForm), canActivate: [roleGuard('partenaire')] },
      { path: 'demandes-recues', loadComponent: () => import('./dashboard/demandes/demandes').then(m => m.Demandes), data: { mode: 'recues' }, canActivate: [roleGuard('partenaire')] },
      { path: 'mes-demandes', loadComponent: () => import('./dashboard/demandes/demandes').then(m => m.Demandes), data: { mode: 'mes' }, canActivate: [roleGuard('client')] },
      { path: 'favoris', loadComponent: () => import('./dashboard/favoris/favoris').then(m => m.Favoris), canActivate: [roleGuard('client')] },
      { path: 'transactions', loadComponent: () => import('./dashboard/transactions/transactions').then(m => m.Transactions), canActivate: [roleGuard('client', 'partenaire')] },
      { path: 'messages', loadComponent: () => import('./dashboard/messages/messages').then(m => m.Messages) },
      { path: 'notifications', loadComponent: () => import('./dashboard/notifications/notifications').then(m => m.Notifications) },
      { path: 'profile', loadComponent: () => import('./dashboard/profile/profile').then(m => m.Profile) },
      { path: 'admin/biens', loadComponent: () => import('./dashboard/admin-biens/admin-biens').then(m => m.AdminBiens), canActivate: [roleGuard('admin')] },
      { path: 'admin/users', loadComponent: () => import('./dashboard/admin-users/admin-users').then(m => m.AdminUsers), canActivate: [roleGuard('admin')] },
      { path: 'admin/demandes', loadComponent: () => import('./dashboard/admin-demandes/admin-demandes').then(m => m.AdminDemandes), canActivate: [roleGuard('admin')] },
      { path: 'admin/transactions', loadComponent: () => import('./dashboard/admin-transactions/admin-transactions').then(m => m.AdminTransactions), canActivate: [roleGuard('admin')] },
      { path: 'admin/references', loadComponent: () => import('./dashboard/admin-references/admin-references').then(m => m.AdminReferences), canActivate: [roleGuard('admin')] },
    ],
  },

  { path: '**', loadComponent: () => import('./pages/not-found/not-found').then(m => m.NotFound) },
];
