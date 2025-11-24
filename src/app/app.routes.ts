import { Routes } from '@angular/router';
import { NotFound } from './pages/not-found/not-found';
import { Home } from './pages/home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home', component: Home },

  // Autres
  // { path: 'contacts', component: ContactsComponent },
  // { path: 'support', component: SupportComponent },
  // { path: 'faq', component: FaqComponent },
  { path: '**', component: NotFound }
];
