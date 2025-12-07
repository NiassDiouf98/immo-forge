import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Footer } from "../../shared/components/footer/footer";
import { Navbar } from "../../shared/components/navbar/navbar";

@Component({
  selector: 'app-contact',
  imports: [FormsModule, MatIconModule, CommonModule, Footer, Navbar],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {

  form = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  loading = false;
  success = false;

  submit() {
    this.loading = true;
    this.success = false;

    setTimeout(() => {
      this.loading = false;
      this.success = true;

      console.log("Contact form envoyé :", this.form);
      // 💡 À connecter au backend (Laravel ou Node)
    }, 1500);
  }
}
