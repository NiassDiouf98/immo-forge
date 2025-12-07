import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ CommonModule, FormsModule, MatIconModule, RouterLink ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  loading = false;

  register() {
    this.loading = true;

    // Simulation d’une requête API
    setTimeout(() => {
      this.loading = false;

      if (this.password !== this.confirmPassword) {
        alert("Les mots de passe ne correspondent pas !");
        return;
      }

      console.log("Inscription :", this.name, this.email);
      // 🔥 A connecter au backend (Laravel ou Node)
    }, 1500);
  }
}
