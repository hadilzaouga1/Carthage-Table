import ApiError from './ApiError.js';

// Arrondit à 3 décimales (le dinar a des millimes)
export const round = (n) => Math.round(n * 1000) / 1000;

// Codes promo connus du serveur (le serveur décide, jamais Angular)
export const PROMOS = {
  RESTORA10: { type: 'percent', value: 10 },   // -10 % sur le sous-total
  BIENVENUE: { type: 'free_delivery' }          // livraison offerte
};

// Règle 6 : le total est TOUJOURS calculé par le serveur.
// Total = SousTotal - Remise + FraisLivraison
// lignes : [{ quantite, prixUnitaire }]
export function computeTotals(lignes, fraisLivraisonRestaurant, codePromo) {
  const sousTotal = round(lignes.reduce((somme, l) => somme + l.quantite * l.prixUnitaire, 0));

  const code = typeof codePromo === 'string' ? codePromo.trim().toUpperCase() : '';
  let remise = 0;
  let fraisLivraison = fraisLivraisonRestaurant;

  if (code) {
    const promo = PROMOS[code];
    if (!promo) throw new ApiError(400, `Code promo invalide : ${code}`);
    if (promo.type === 'percent') remise = round(Math.min(sousTotal, (sousTotal * promo.value) / 100));
    if (promo.type === 'free_delivery') fraisLivraison = 0;
  }

  const total = round(Math.max(0, sousTotal - remise) + fraisLivraison);
  return { sousTotal, codePromo: code || null, remise, fraisLivraison, total };
}
