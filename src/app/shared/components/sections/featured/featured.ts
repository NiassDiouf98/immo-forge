import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

interface Property {
  title: string;
  price: number;
  location: string;
  image: string;
  type: string;
}

@Component({
  selector: 'app-featured',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './featured.html',
  styleUrl: './featured.css',
})
export class Featured {

  properties: Property[] = [
    {
      title: "Appartement Moderne",
      price: 35000000,
      location: "Dakar, Point E",
      type: "Appartement",
      image: "/assets/prop1.png"
    },
    {
      title: "Villa Haut Standing",
      price: 125000000,
      location: "Dakar, Almadies",
      type: "Villa",
      image: "./assets/prop2.png"
    },
    {
      title: "Studio Meublé",
      price: 18000000,
      location: "Dakar, Sacré-Cœur",
      type: "Studio",
      image: "./assets/prop3.png"
    }
  ];
}
