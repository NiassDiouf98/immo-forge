import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface Testimonial {
  name: string;
  role: string;
  message: string;
  image: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
})
export class Testimonials implements OnInit, OnDestroy {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  testimonials: Testimonial[] = [
    {
      name: "Khady Gaye",
      role: "Propriétaire",
      message: "ImmoForge m’a permis de gérer mes biens plus facilement que jamais. Interface intuitive et support excellent.",
      image: "/assets/testimonials/client1.jpg",
    },
    {
      name: "Niasse Diouf",
      role: "Client",
      message: "J’ai trouvé mon appartement en quelques minutes. La recherche avancée est vraiment performante.",
      image: "/assets/testimonials/client2.jpg",
    },
    {
      name: "Moustapha Diaw",
      role: "Propriétaire",
      message: "La gestion des paiements est fluide et sécurisée. Je recommande vivement ImmoForge.",
      image: "/assets/testimonials/client3.jpg",
    }
  ];

  activeIndex = 0;
  intervalId: number | undefined;

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
  }

  startAutoSlide() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = window.setInterval(() => {
        this.next();
      }, 4000);
    }
  }

  next() {
    this.activeIndex = (this.activeIndex + 1) % this.testimonials.length;
  }

  prev() {
    this.activeIndex =
      (this.activeIndex - 1 + this.testimonials.length) % this.testimonials.length;
  }
}
