export interface Restaurant {
  _id: string;
  nom: string;
  description: string;
  adresse: string;
  typeCuisine: string;
  image: string;
  icon: string;
  fraisLivraison: number;
  horaires: string;
  isOpen: boolean;
  status: 'pending' | 'approved' | 'suspended';
}

export interface Category {
  _id: string;
  nom: string;
  description: string;
  restaurant: string;
}

export interface Dish {
  _id: string;
  nom: string;
  description: string;
  prix: number;
  image: string;
  icon: string;
  disponible: boolean;
  categorie: string;
  restaurant: string;
}

export interface RestaurantList {
  success: boolean;
  items: Restaurant[];
  total: number;
  page: number;
  pages: number;
}

export interface RestaurantMenu {
  success: boolean;
  restaurant: Restaurant;
  categories: Category[];
  dishes: Dish[];
}

export interface RestaurantQuery {
  q?: string;
  cuisine?: string;
  open?: boolean;
  page?: number;
  limit?: number;
}
