import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  auth = inject(AuthService);
  private toast = inject(ToastService);

  form = { prenom: '', nom: '', telephone: '' };
  pwd = { ancien: '', nouveau: '', confirm: '' };
  saving = false;
  changing = false;
  pwdError = '';

  ngOnInit() {
    const u = this.auth.user();
    if (u) this.form = { prenom: u.prenom ?? '', nom: u.nom ?? '', telephone: u.telephone ?? '' };
  }

  saveProfile() {
    this.saving = true;
    this.auth.updateProfile(this.form).subscribe({
      next: () => { this.saving = false; this.toast.success('Profil mis à jour'); },
      error: e => { this.saving = false; this.toast.error(errorMessage(e)); },
    });
  }

  changePassword() {
    this.pwdError = '';
    if (this.pwd.nouveau.length < 6) { this.pwdError = 'Le nouveau mot de passe doit contenir au moins 6 caractères'; return; }
    if (this.pwd.nouveau !== this.pwd.confirm) { this.pwdError = 'Les mots de passe ne correspondent pas'; return; }
    this.changing = true;
    this.auth.changePassword(this.pwd.ancien, this.pwd.nouveau).subscribe({
      next: () => { this.changing = false; this.pwd = { ancien: '', nouveau: '', confirm: '' }; this.toast.success('Mot de passe modifié'); },
      error: e => { this.changing = false; this.pwdError = errorMessage(e); },
    });
  }
}
