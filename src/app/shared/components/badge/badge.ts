import { Component, computed, input } from '@angular/core';

const STYLES: Record<string, [string, string]> = {
  en_attente: ['En attente', 'bg-amber-100 text-amber-800'],
  en_attente_validation: ['En attente de validation', 'bg-amber-100 text-amber-800'],
  acceptee: ['Acceptée', 'bg-green-100 text-green-800'],
  valide: ['Validé', 'bg-green-100 text-green-800'],
  payee: ['Payée', 'bg-green-100 text-green-800'],
  reussi: ['Réussi', 'bg-green-100 text-green-800'],
  actif: ['Actif', 'bg-green-100 text-green-800'],
  refusee: ['Refusée', 'bg-red-100 text-red-800'],
  refuse: ['Refusé', 'bg-red-100 text-red-800'],
  annulee: ['Annulée', 'bg-gray-200 text-gray-700'],
  echoue: ['Échoué', 'bg-red-100 text-red-800'],
  suspendu: ['Suspendu', 'bg-red-100 text-red-800'],
  inactif: ['Inactif', 'bg-gray-200 text-gray-700'],
  indisponible: ['Indisponible', 'bg-gray-200 text-gray-700'],
};

@Component({
  selector: 'app-badge',
  template: `<span class="inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap" [class]="style()[1]">{{ style()[0] }}</span>`,
})
export class Badge {
  value = input.required<string>();
  style = computed(() => STYLES[this.value()] ?? [this.value(), 'bg-gray-200 text-gray-700']);
}
