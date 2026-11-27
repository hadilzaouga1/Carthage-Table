import test from 'node:test';
import assert from 'node:assert/strict';
import { computeTotals, PROMOS } from '../utils/pricing.js';
import { canTransition, STATUTS } from '../utils/orderStatus.js';

test('pricing: contient RESTORA10 et non CARTHAGE10', () => {
  assert.ok(PROMOS.RESTORA10);
  assert.equal(PROMOS.RESTORA10.value, 10);
  assert.equal(PROMOS.CARTHAGE10, undefined);
});

test('pricing: computeTotals applique correctement RESTORA10 (-10%)', () => {
  const lignes = [{ quantite: 2, prixUnitaire: 20 }]; // sousTotal = 40
  const totals = computeTotals(lignes, 5, 'RESTORA10');
  assert.equal(totals.sousTotal, 40);
  assert.equal(totals.remise, 4);
  assert.equal(totals.fraisLivraison, 5);
  assert.equal(totals.total, 41);
});

test('pricing: computeTotals applique BIENVENUE (livraison offerte)', () => {
  const lignes = [{ quantite: 1, prixUnitaire: 30 }];
  const totals = computeTotals(lignes, 7, 'BIENVENUE');
  assert.equal(totals.sousTotal, 30);
  assert.equal(totals.remise, 0);
  assert.equal(totals.fraisLivraison, 0);
  assert.equal(totals.total, 30);
});

test('pricing: computeTotals rejette un code promo inconnu', () => {
  const lignes = [{ quantite: 1, prixUnitaire: 30 }];
  assert.throws(() => computeTotals(lignes, 5, 'FAUX_CODE'), (err) => err.statusCode === 400);
});

test('orderStatus: transitions respectent le cycle de vie', () => {
  assert.equal(canTransition('en_attente', 'acceptee'), true);
  assert.equal(canTransition('en_attente', 'annulee'), true);
  assert.equal(canTransition('en_attente', 'livree'), false);
  assert.equal(canTransition('en_livraison', 'livree'), true);
  assert.equal(canTransition('livree', 'annulee'), false);
  assert.equal(STATUTS.includes('livree'), true);
});
