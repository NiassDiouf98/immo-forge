import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api.service';
import { Refs } from '../../../../core/models/models';

@Component({
  selector: 'app-hero-section',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  refs: Refs = { zones: [], types: [], statuts: [] };
  search = { type_id: '', zone_id: '', search: '' };

  ngOnInit() {
    this.api.refs().subscribe({ next: r => (this.refs = r), error: () => {} });
  }

  onSearch() {
    this.router.navigate(['/properties'], { queryParams: { ...this.search } });
  }
}
