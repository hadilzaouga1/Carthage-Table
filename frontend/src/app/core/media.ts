import { API_URL } from './config';

const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const DEFAULT_DISH_IMAGE = 'img/plats/default-dish1.jpg';

export function dishPhotoUrl(image?: string): string {
  if (!image || !image.trim()) return DEFAULT_DISH_IMAGE;
  const clean = image.trim();
  if (/^(https?:)?\/\//.test(clean) || clean.startsWith('data:')) return clean;
  if (clean.startsWith('/uploads/')) return `${BACKEND_ORIGIN}${clean}`;
  if (clean.startsWith('img/')) return clean;
  return `img/${clean}`;
}
