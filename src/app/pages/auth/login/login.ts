import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ CommonModule, MatIconModule, FormsModule, RouterModule ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  email = '';
  password = '';

  loading = false;

  login() {
    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      console.log("Tentative de connexion :", this.email, this.password);
      // 🔥 à connecter au backend (Laravel ou Node)
    }, 1500);
  }
}
