import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { errorMessage } from '../../../utils/helpers';

@Component({
  selector: 'app-register',
  imports: [ CommonModule, FormsModule, MatIconModule, RouterLink ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private auth = inject(AuthService);
  private router = inject(Router);
  private toast = inject(ToastService);

  prenom = '';
  nom = '';
  email = '';
  telephone = '';
  role: 'client' | 'partenaire' = 'client';
  password = '';
  confirmPassword = '';
  loading = false;
  error = '';

  register() {
    this.error = '';
    if (!this.prenom.trim() || !this.nom.trim() || !this.email.trim() || !this.password) {
      this.error = 'Tous les champs marqués sont obligatoires';
      return;
    }
    if (this.password.length < 6) {
      this.error = 'Le mot de passe doit contenir au moins 6 caractères';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.loading = true;
    this.auth.register({
      prenom: this.prenom.trim(),
      nom: this.nom.trim(),
      email: this.email.trim(),
      telephone: this.telephone.trim() || undefined,
      mot_de_passe: this.password,
      role_nom: this.role,
    }).subscribe({
      next: () => { this.toast.success('Bienvenue sur ImmoForge !'); this.router.navigate(['/dashboard']); },
      error: e => { this.loading = false; this.error = errorMessage(e, 'Inscription impossible'); },
    });
  }
}
