import { Component } from '@angular/core';

interface Testimonial {
  name: string;
  role: string;
  message: string;
  image: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials {
  testimonials: Testimonial[] = [
    {
      name: 'Khady Gaye',
      role: 'Propriétaire',
      message: 'ImmoForge m’a permis de gérer mes biens plus facilement que jamais. Interface intuitive et support excellent.',
      image: '/assets/testimonials/client1.jpg',
    },
    {
      name: 'Niasse Diouf',
      role: 'Client',
      message: 'J’ai trouvé mon appartement en quelques minutes. La recherche avancée est vraiment performante.',
      image: '/assets/testimonials/client2.jpg',
    },
    {
      name: 'Moustapha Diaw',
      role: 'Propriétaire',
      message: 'La gestion des paiements est fluide et sécurisée. Je recommande vivement ImmoForge.',
      image: '/assets/testimonials/client3.jpg',
    },
  ];
}
