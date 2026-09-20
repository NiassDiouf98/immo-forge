import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { RoleName } from '../models/models';

/** Réserve une route aux utilisateurs connectés. */
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  if (auth.isLoggedIn()) return true;
  return inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

/** Réserve une route à certains rôles (ex. roleGuard('admin')). */
export const roleGuard = (...roles: RoleName[]): CanActivateFn => () => {
  const auth = inject(AuthService);
  if (auth.hasRole(...roles)) return true;
  return inject(Router).createUrlTree(auth.isLoggedIn() ? ['/dashboard'] : ['/login']);
};

/** Empêche un utilisateur connecté d'ouvrir login / register. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? inject(Router).createUrlTree(['/dashboard']) : true;
};
