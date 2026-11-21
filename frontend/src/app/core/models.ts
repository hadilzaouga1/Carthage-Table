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