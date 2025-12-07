import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Footer } from "../../../shared/components/footer/footer";
import { Navbar } from "../../../shared/components/navbar/navbar";

interface Property {
  id: number;
  title: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  size: number;
  image: string;
}

@Component({
  selector: 'app-properties-lists',
  imports: [CommonModule, FormsModule, MatIconModule, RouterLink, Footer, Navbar],
  templateUrl: './properties-lists.html',
  styleUrl: './properties-lists.css',
})
export class PropertiesLists {

  filters = {
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
  };

  properties: Property[] = [
    {
      id: 1,
      title: "Appartement de standing aux Almadies",
      location: "Dakar, Almadies",
      price: 45000000,
      bedrooms: 3,
      bathrooms: 2,
      size: 140,
      image: "/assets/properties/p1.png"
    },
    {
      id: 2,
      title: "Villa moderne à Saly",
      location: "Mbour, Saly",
      price: 125000000,
      bedrooms: 5,
      bathrooms: 4,
      size: 320,
      image: "/assets/properties/p2.png"
    },
    {
      id: 3,
      title: "Studio chic au Plateau",
      location: "Dakar, Plateau",
      price: 15000000,
      bedrooms: 1,
      bathrooms: 1,
      size: 45,
      image: "/assets/properties/p3.png"
    },
  ];

  applyFilters() {
    console.log("Filtres :", this.filters);
    // À relier au backend plus tard
  }

  resetFilters() {
    this.filters = {
      type: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: ''
    };
  }
}
