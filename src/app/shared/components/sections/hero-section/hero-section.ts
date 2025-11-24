import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-hero-section',
  imports: [ CommonModule, FormsModule ],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.css',
})
export class HeroSection {

  search = {
    type: '',
    location: '',
    minPrice: null,
    maxPrice: null
  };

  onSearch() {
    console.log("Recherche envoyée :", this.search);
    // Ici tu feras la redirection vers results page
  }
}
