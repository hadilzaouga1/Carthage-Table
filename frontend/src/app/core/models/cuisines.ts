export interface Cuisine { key: string; icon: string; }

export const CUISINES: Cuisine[] = [
  { key: 'Tous', icon: '🍽️' }, { key: 'Pizza', icon: '🍕' }, { key: 'Fast-food', icon: '🍔' },
  { key: 'Tunisien', icon: '🥘' }, { key: 'Italien', icon: '🍝' }, { key: 'Desserts', icon: '🍰' },
  { key: 'Boissons', icon: '🥤' },
];

/** Teinte douce de la vignette d'un restaurant, selon sa cuisine. */
export const CUISINE_TINTS: Record<string, string> = {
  Pizza: '#f6dfb8', Tunisien: '#e5e3f4', 'Fast-food': '#f3e0c8',
  Italien: '#e8ecd2', Desserts: '#f4d9d3', Boissons: '#dcebe4',
};

export const formatPrice = (value: number): string => `${String(value).replace('.', ',')} DT`;
