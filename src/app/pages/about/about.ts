import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Footer } from "../../shared/components/footer/footer";
import { Navbar } from "../../shared/components/navbar/navbar";

interface Advantage {
  icon: string;
  title: string;
  description: string;
}
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, MatIconModule, Footer, Navbar],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {

  advantages: Advantage[] = [
    {
      icon: "verified",
      title: "Fiabilité garantie",
      description: "Nous assurons une vérification rigoureuse des propriétaires et des annonces."
    },
    {
      icon: "bolt",
      title: "Plateforme moderne",
      description: "Une technologie rapide, intuitive et conçue pour offrir une expérience fluide."
    },
    {
      icon: "payments",
      title: "Transactions sécurisées",
      description: "Payez et recevez vos paiements via des solutions sécurisées."
    },
    {
      icon: "support_agent",
      title: "Support dédié",
      description: "Une équipe prête à vous accompagner 24/7."
    }
  ];

}
