import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { errorMessage } from '../../../utils/helpers';

@Component({
  selector: 'app-forgot-password',
  imports: [MatIconModule, FormsModule, CommonModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private auth = inject(AuthService);

  email = '';
  loading = false;
  sent = false;
  message = '';
  error = '';

  submit() {
    if (!this.email.trim()) { this.error = 'Renseignez votre email'; return; }
    this.loading = true;
    this.sent = false;
    this.error = '';
    this.auth.forgotPassword(this.email.trim()).subscribe({
      next: r => { this.loading = false; this.sent = true; this.message = r.message; },
      error: e => { this.loading = false; this.error = errorMessage(e); },
    });
  }
}
