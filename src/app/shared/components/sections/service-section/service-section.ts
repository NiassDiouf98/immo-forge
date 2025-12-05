import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

interface Service {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-service-section',
  imports: [ CommonModule, MatIconModule ],
  templateUrl: './service-section.html',
  styleUrls: ['./service-section.css'],
})
export class ServiceSection {
  services: Service[] = [
    {
      icon: "home",
      title: "Gestion de Propriétés",
      description: "Ajoutez, modifiez et gérez facilement vos biens immobiliers avec suivi en temps réel."
    },
    {
      icon: "search",
      title: "Recherche Avancée",
      description: "Trouvez rapidement la propriété idéale grâce à notre moteur de recherche intelligent."
    },
    {
      icon: "payments",
      title: "Paiements Sécurisés",
      description: "Effectuez vos transactions en toute sécurité via nos solutions de paiement intégrées."
    },
    {
      icon: "notifications",
      title: "Notifications Instantanées",
      description: "Recevez des alertes en temps réel concernant vos biens, vos paiements et vos demandes."
    }
  ];
}
