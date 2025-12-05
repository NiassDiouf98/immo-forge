import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface City {
  name: string;
  image: string;
  properties: number;
}

@Component({
  selector: 'app-cities-section',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './cities-section.html',
  styleUrl: './cities-section.css',
})
export class CitiesSection {
  cities: City[] = [
    {
      name: "Dakar",
      properties: 128,
      image: "/assets/cities/dk-ville.jpeg",
    },
    {
      name: "Thiès",
      properties: 42,
      image: "/assets/cities/th-ville.jpeg",
    },
    {
      name: "Saint-Louis",
      properties: 33,
      image: "/assets/cities/sl-ville.jpeg",
    },
    {
      name: "Ziguinchor",
      properties: 18,
      image: "/assets/cities/zg-ville.jpeg",
    }
  ];

  goToCity(city: string) {
    console.log("Explorer :", city);
    // plus tard: naviguer vers /properties?city=xxxx
  }
}
