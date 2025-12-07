import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-forgot-password',
  imports: [MatIconModule, FormsModule, CommonModule],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {

  email = '';
  loading = false;
  sent = false;

  submit() {
    this.loading = true;
    this.sent = false;

    setTimeout(() => {
      this.loading = false;
      this.sent = true;
      console.log("Réinitialisation envoyée à :", this.email);
      // 🔥 À connecter à ton backend plus tard
    }, 1500);
  }
}
