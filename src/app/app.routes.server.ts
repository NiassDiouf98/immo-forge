import { RenderMode, ServerRoute } from '@angular/ssr';

// Les écrans dépendent de la session (JWT en localStorage) et de l'API : rendu côté client.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client
  }
];
