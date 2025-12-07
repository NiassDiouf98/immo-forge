import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

interface UserProperty {
  id: number;
  title: string;
  location: string;
  price: number;
  image: string;
}

@Component({
  selector: 'app-profile',
  imports: [ CommonModule, FormsModule, MatIconModule, RouterLink ],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {

  user = {
    name: "Fatou Diouf",
    email: "fatou.diouf@mail.com",
    phone: "+221 77 123 45 67",
    role: "Propriétaire",
    avatar: "/assets/auth/user1.jpeg"
  };

  // Prévisualisation image upload
  avatarPreview: string | ArrayBuffer | null = null;

  properties: UserProperty[] = [
    {
      id: 1,
      title: "Villa contemporaine aux Almadies",
      location: "Dakar, Almadies",
      price: 125000000,
      image: "/assets/properties/p1.png"
    },
    {
      id: 2,
      title: "Appartement standing Plateau",
      location: "Dakar, Plateau",
      price: 45000000,
      image: "/assets/properties/p3.png"
    },
    {
      id: 3,
      title: "Studio moderne Sacré Coeur",
      location: "Dakar, Sacré Coeur",
      price: 15000000,
      image: "/assets/properties/p2.png"
    }
  ];

  onAvatarChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => this.avatarPreview = e.target?.result ?? null;
    reader.readAsDataURL(file);
  }
}
