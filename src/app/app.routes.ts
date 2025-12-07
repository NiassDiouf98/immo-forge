import { Routes } from '@angular/router';
import { NotFound } from './pages/not-found/not-found';
import { Home } from './pages/home/home';
import { About } from './pages/about/about';
import { Login } from './pages/auth/login/login';
import { ForgotPassword } from './pages/auth/forgot-password/forgot-password';
import { Register } from './pages/auth/register/register';
import { PropertiesLists } from './pages/properties/properties-lists/properties-lists';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  // Pages principales
  { path: 'home', component: Home },
  { path: 'about', component: About },
  { path: 'properties', component: PropertiesLists },
  { path: 'property', component: PropertiesLists },

  // Auth
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'forgot-password', component: ForgotPassword },

  // Autres
  // { path: 'contacts', component: Contacts },
  // { path: 'support', component: SupportComponent },
  // { path: 'faq', component: FaqComponent },
  { path: '**', component: NotFound }
];
