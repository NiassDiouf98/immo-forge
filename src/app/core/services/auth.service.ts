import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { RoleName, User } from '../models/models';

const TOKEN_KEY = 'immoforge_token';
const USER_KEY = 'immoforge_user';

export interface RegisterPayload {
  email: string;
  mot_de_passe: string;
  prenom: string;
  nom: string;
  telephone?: string;
  role_nom: 'client' | 'partenaire';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private api = `${environment.apiUrl}/auth`;

  readonly user = signal<User | null>(this.readUser());
  readonly isLoggedIn = computed(() => !!this.user());
  readonly role = computed<RoleName | null>(() => this.user()?.role?.nom ?? null);
  readonly fullName = computed(() => {
    const u = this.user();
    return u ? `${u.prenom ?? ''} ${u.nom ?? ''}`.trim() || u.email : '';
  });

  get token(): string | null {
    return this.isBrowser ? localStorage.getItem(TOKEN_KEY) : null;
  }

  login(email: string, mot_de_passe: string): Observable<User> {
    return this.http
      .post<{ data: { user: User; token: string } }>(`${this.api}/login`, { email, mot_de_passe })
      .pipe(tap(r => this.setSession(r.data.user, r.data.token)), map(r => r.data.user));
  }

  register(payload: RegisterPayload): Observable<User> {
    return this.http
      .post<{ data: { user: User; token: string } }>(`${this.api}/register`, payload)
      .pipe(tap(r => this.setSession(r.data.user, r.data.token)), map(r => r.data.user));
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(`${this.api}/forgot-password`, { email });
  }

  /** Recharge le profil depuis l'API (valide aussi le token stocké). */
  refreshProfile(): Observable<User> {
    return this.http.get<{ data: { user: User } }>(`${this.api}/profile`).pipe(
      tap(r => this.saveUser(r.data.user)),
      map(r => r.data.user),
    );
  }

  updateProfile(data: Partial<Pick<User, 'prenom' | 'nom' | 'telephone'>>): Observable<User> {
    return this.http.put<{ data: { user: User } }>(`${this.api}/profile`, data).pipe(
      tap(r => this.saveUser(r.data.user)),
      map(r => r.data.user),
    );
  }

  changePassword(ancien_mot_de_passe: string, nouveau_mot_de_passe: string) {
    return this.http.put<{ message: string }>(`${this.api}/change-password`, {
      ancien_mot_de_passe,
      nouveau_mot_de_passe,
    });
  }

  logout(redirect = true) {
    if (this.isBrowser) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.user.set(null);
    if (redirect) this.router.navigate(['/login']);
  }

  hasRole(...roles: RoleName[]): boolean {
    const r = this.role();
    return !!r && roles.includes(r);
  }

  private setSession(user: User, token: string) {
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, token);
    this.saveUser(user);
  }

  private saveUser(user: User) {
    if (this.isBrowser) localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readUser(): User | null {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return null;
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) ?? 'null');
    } catch {
      return null;
    }
  }
}
