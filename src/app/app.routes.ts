import { Routes } from '@angular/router';
import { NotFound } from './pages/not-found/not-found';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Login } from './pages/auth/login/login';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { Register } from './pages/auth/register/register';
import { PropertiesLists } from './pages/properties/properties-lists/properties-lists';
import { PropertyDetail } from './pages/properties/property-detail/property-detail';
import { Contact } from './pages/contact/contact';
import { Profile } from './pages/profile/profile';
import { Layout } from './dashboard/layout/layout';
import { DashboardProprietaire } from './dashboard/dashboard-proprietaire/dashboard-proprietaire';
import { PropertyForm } from './dashboard/property-form/property-form';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages principales
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'properties', component: PropertiesLists },
  { path: 'property', component: PropertiesLists },
  { path: "property/:id", component: PropertyDetail },

  // Auth
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'profile', component: Profile },

  // Dashboard Propriétaire
  { path: 'dashboard', component: Layout, children: [
  { path: 'dashboard-proprietaire', component: DashboardProprietaire },
  { path: 'properties', component: PropertiesLists },
  { path: 'create-property', component: PropertyForm },

  ]},

  // Autres
  // { path: 'support', component: SupportComponent },
  // { path: 'faq', component: FaqComponent },
  { path: '**', component: NotFound }
];
