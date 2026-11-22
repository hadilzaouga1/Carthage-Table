// Les 3 rôles de l'application
export type Role = 'client' | 'restaurateur' | 'admin';

// Un utilisateur tel que le renvoie le backend
export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: Role;
}

// Réponse de /auth/login et /auth/register : un token + l'utilisateur
export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export type OrderStatus =
  | 'en_attente'
  | 'acceptee'
  | 'en_preparation'
  | 'en_livraison'
  | 'livree'
  | 'annulee';

export interface OrderItem {
  plat: string;
  nom: string;
  quantite: number;
  prixUnitaire: number;
}

export interface OrderRestaurantRef {
  _id?: string;
  nom: string;
  image?: string;
  adresse?: string;
}

export interface Order {
  _id: string;
  restaurant: OrderRestaurantRef;
  articles: OrderItem[];
  adresseLivraison: string;
  sousTotal?: number;
  codePromo?: string | null;
  remise?: number;
  fraisLivraison: number;
  total: number;
  modePaiement?: 'livraison' | 'en_ligne';
  statut: OrderStatus;
  remarque?: string;
  createdAt: string;
}

export interface CreateOrderPayload {
  restaurant: string;
  articles: { plat: string; quantite: number }[];
  adresseLivraison: string;
  remarque?: string;
  codePromo?: string;
  modePaiement?: 'livraison' | 'en_ligne';
}