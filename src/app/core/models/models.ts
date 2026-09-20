export type RoleName = 'admin' | 'partenaire' | 'client';

export interface Role { id: number; nom: RoleName; }

export interface User {
  id: number;
  role_id: number;
  prenom: string | null;
  nom: string | null;
  email: string;
  telephone: string | null;
  statut: 'actif' | 'inactif' | 'suspendu';
  date_creation: string;
  role?: Role;
}

export interface Ref { id: number; nom: string; }

export interface BienImage { id: number; url_image: string; ordre: number; }

export interface Tarif {
  id?: number;
  type_tarif: 'location_mensuelle' | 'vente' | 'caution' | 'acompte';
  montant: number | string;
  devise?: string;
}

export interface Bien {
  id: number;
  proprietaire_id: number;
  type_id: number;
  zone_id: number | null;
  titre: string;
  description: string | null;
  adresse: string | null;
  latitude: string | null;
  longitude: string | null;
  prix: string | null;
  chambres: number | null;
  salles_bain: number | null;
  surface: string | null;
  status_id: number;
  raison_refus: string | null;
  date_ajout: string;
  type?: Ref;
  zone?: Ref;
  status?: Ref;
  images?: BienImage[];
  tarifs?: Tarif[];
  proprietaire?: Pick<User, 'id' | 'prenom' | 'nom' | 'email' | 'telephone'>;
}

export interface Pagination { total: number; page: number; limit: number; totalPages: number; }

export interface Demande {
  id: number;
  client_id: number;
  bien_id: number;
  message: string | null;
  statut: 'en_attente' | 'acceptee' | 'refusee';
  date_demande: string;
  client?: Pick<User, 'id' | 'prenom' | 'nom' | 'email' | 'telephone'>;
  bien?: Bien;
}

export interface Paiement {
  id: number;
  montant: string;
  mode_paiement: string;
  statut: 'en_attente' | 'reussi' | 'echoue';
  date_paiement: string;
}

export interface Transaction {
  id: number;
  bien_id: number;
  user_id: number;
  type_transaction: 'location' | 'vente';
  montant: string;
  status: 'en_attente' | 'payee' | 'annulee';
  date_transaction: string;
  bien?: Bien;
  paiements?: Paiement[];
}

export interface Favori { id: number; bien_id: number; date_favoris: string; bien?: Bien; }

export interface Message {
  id: number;
  expediteur_id: number;
  destinataire_id: number;
  contenu: string;
  date_message: string;
  expediteur?: Pick<User, 'id' | 'prenom' | 'nom'>;
  destinataire?: Pick<User, 'id' | 'prenom' | 'nom'>;
}

export interface Notification {
  id: number;
  titre: string;
  contenu: string;
  est_lu: boolean;
  date_notification: string;
}

export interface Stats { role: RoleName; stats: Record<string, number>; }

export interface Refs { zones: Ref[]; types: Ref[]; statuts: Ref[]; }
