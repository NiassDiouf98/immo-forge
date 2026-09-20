import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { errorMessage } from '../../../utils/helpers';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, MatIconModule, FormsModule, RouterModule ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  /** Comptes de démonstration : affichés uniquement hors production. */
  demoAccounts = environment.production ? [] : [
    { role: 'Administrateur', icon: 'admin_panel_settings', email: 'admin@immorforge.sn', password: 'Admin@123' },
    { role: 'Propriétaire', icon: 'real_estate_agent', email: 'partenaire@immorforge.sn', password: 'Partenaire@123' },
    { role: 'Client', icon: 'person', email: 'client@immorforge.sn', password: 'Client@123' },
  ];

  email = '';
  password = '';
  loading = false;
  showPassword = false;
  error = '';

  fillDemo(a: { email: string; password: string }) {
    this.email = a.email;
    this.password = a.password;
    this.error = '';
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Renseignez votre email et votre mot de passe';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        this.router.navigateByUrl(returnUrl && returnUrl.startsWith('/') ? returnUrl : '/dashboard');
      },
      error: e => { this.loading = false; this.error = errorMessage(e, 'Connexion impossible'); },
    });
  }
}
