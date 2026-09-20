import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/** Ajoute le JWT aux requêtes API et déconnecte l'utilisateur si le token est refusé. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.token;
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthCall = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && token && !isAuthCall) auth.logout();
      return throwError(() => err);
    }),
  );
};
