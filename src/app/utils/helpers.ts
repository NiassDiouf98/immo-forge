import { HttpErrorResponse } from '@angular/common/http';

/** Extrait un message lisible d'une erreur HTTP de l'API. */
export function errorMessage(err: unknown, fallback = 'Une erreur est survenue'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return "Impossible de joindre le serveur. Vérifiez que l'API est démarrée.";
    return err.error?.message ?? fallback;
  }
  return fallback;
}

export function fullName(u?: { prenom?: string | null; nom?: string | null } | null): string {
  return u ? `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || 'Utilisateur' : '';
}
