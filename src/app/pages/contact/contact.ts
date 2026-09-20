import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Footer } from "../../shared/components/footer/footer";
import { Navbar } from "../../shared/components/navbar/navbar";
import { ApiService } from '../../core/services/api.service';
import { errorMessage } from '../../utils/helpers';

@Component({
  selector: 'app-contact',
  imports: [FormsModule, MatIconModule, CommonModule, Footer, Navbar],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  private api = inject(ApiService);

  form = { name: '', email: '', phone: '', message: '' };

  loading = false;
  success = false;
  error = '';

  submit() {
    if (!this.form.name.trim() || !this.form.email.trim() || !this.form.message.trim()) {
      this.error = 'Nom, email et message sont obligatoires';
      return;
    }
    this.loading = true;
    this.success = false;
    this.error = '';
    this.api.contact(this.form).subscribe({
      next: () => { this.loading = false; this.success = true; this.form = { name: '', email: '', phone: '', message: '' }; },
      error: e => { this.loading = false; this.error = errorMessage(e); },
    });
  }
}
