import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
  description: string;
  images: string[];
  planImage: string;
  latitude: number;
  longitude: number;
  owner: {
    name: string;
    phone: string;
    email: string;
  };
}

@Component({
  selector: 'app-property-detail',
  imports: [CommonModule, MatIconModule, Footer, Navbar],
  templateUrl: './property-detail.html',
  styleUrl: './property-detail.css',
})
export class PropertyDetail implements OnInit {

  property!: Property;
  selectedImage = 0;
  safeMapUrl!: SafeResourceUrl;

  constructor(private route: ActivatedRoute, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    // Simulation (à remplacer par API)
    this.property = {
      id,
      title: "Villa contemporaine aux Almadies",
      location: "Dakar, Almadies",
      price: 125000000,
      bedrooms: 5,
      bathrooms: 4,
      size: 380,
      description:
        "Magnifique villa contemporaine située au cœur des Almadies, offrant un design moderne, une finition haut de gamme, une piscine privée, un jardin luxuriant et une vue exceptionnelle.",
      images: [
        "/assets/properties/p2.png",
        "/assets/properties/p2-2.png",
        "/assets/properties/p2-3.png",
        "/assets/properties/p2-4.png",
      ],
      planImage: "/assets/properties/plan.png",
      latitude: 14.72223,
      longitude: -17.49312,
      owner: {
        name: "Mamadou Ndiaye",
        phone: "+221 77 123 45 67",
        email: "contact@immoforge.sn"
      }
    };

    // Sanitize the Google Maps URL
    const mapUrl = `https://www.google.com/maps/embed/v1/view?key=YOUR_GOOGLE_API_KEY&center=${this.property.latitude},${this.property.longitude}&zoom=16`;
    this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(mapUrl);
  }

  changeImage(i: number) {
    this.selectedImage = i;
  }

}
