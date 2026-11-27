import { API_URL } from './config';

const BACKEND_ORIGIN = API_URL.replace(/\/api\/?$/, '');
export const DEFAULT_DISH_IMAGE = 'img/plats/default-dish1.jpg';

const DISH_BY_KEYWORD: Array<[string, string]> = [
  ['margherita', 'img/plats/pizza-margherita.jpg'],
  ['4 fromages', 'img/plats/pizza-4-fromages.jpg'],
  ['thon', 'img/plats/pizza-thon.jpg'],
  ['reine', 'img/plats/pizza-reine.jpg'],
  ['végétarienne', 'img/plats/pizza-vegetarienne.jpg'],
  ['vegetarienne', 'img/plats/pizza-vegetarienne.jpg'],
  ['coca', 'img/plats/booga.jpg'],
  ['boga', 'img/plats/booga.jpg'],
  ['fanta', 'img/plats/boogaB.jpg'],
  ['eau', 'img/plats/eau-minerale.jpg'],
  ['tiramisu', 'img/plats/tiramisu.jpg'],
  ['brik', 'img/plats/brik.jpg'],
  ['méchouia', 'img/plats/salade-mechouia.jpg'],
  ['mechouia', 'img/plats/salade-mechouia.jpg'],
  ['couscous', 'img/plats/couscous.jpg'],
  ['lablabi', 'img/plats/lablabi.jpg'],
  ['makroudh', 'img/plats/makroudh.jpg'],
  ['cheeseburger', 'img/plats/cheeseburger.jpg'],
  ['cheese burger', 'img/plats/cheeseburger.jpg'],
  ['chicken', 'img/plats/chicken-burger.jpg'],
  ['milkshake', 'img/plats/milkshake-vanille.jpg'],
  ['spaghetti', 'img/plats/spaghetti-bolognaise.jpg'],
  ['lasagne', 'img/plats/lasagnes.jpg'],
  ['panna cotta', 'img/plats/panna-cotta.jpg'],
  ['baklawa', 'img/plats/baklawa.jpg'],
  ['millefeuille', 'img/plats/millefeuille.jpg'],
  ['assidat', 'img/plats/assidat-zgougou.jpg'],
  ['zgougou', 'img/plats/assidat-zgougou.jpg'],
  ['thé', 'img/plats/the-menthe.jpg'],
  ['menthe', 'img/plats/the-menthe.jpg'],
  ['orange', 'img/plats/jus-orange.jpg'],
  ['avocat', 'img/plats/cocktail-avocat.jpg'],
  ['citronnade', 'img/plats/citronnade.jpg'],
  ['ojja', 'img/plats/ojja-merguez.jpg'],
  ['kafteji', 'img/plats/kafteji.jpg'],
];

export function resolveMediaUrl(image?: string): string {
  if (!image || !image.trim()) return '';
  const clean = image.trim().replace(/^\/+/, '');
  if (/^(https?:)?\/\//.test(image.trim()) || image.trim().startsWith('data:')) return image.trim();
  if (clean.startsWith('uploads/')) return `${BACKEND_ORIGIN}/${clean}`;
  if (clean.startsWith('img/')) return clean;
  return `img/${clean}`;
}

export function dishPhotoUrl(image?: string, dishName?: string): string {
  const resolved = resolveMediaUrl(image);
  if (resolved) return resolved;

  if (dishName) {
    const lower = dishName.toLowerCase();
    const match = DISH_BY_KEYWORD.find(([kw]) => lower.includes(kw));
    if (match) return match[1];
  }
  return DEFAULT_DISH_IMAGE;
}
