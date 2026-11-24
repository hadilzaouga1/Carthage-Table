// Lancer : npm test   (lanceur de tests intégré à Node, aucune dépendance en plus)
import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegister } from '../validators/authValidator.js';

const valide = {
  nom: 'Ben Ali', prenom: 'Ahmed', email: 'ahmed@gmail.com',
  telephone: '22123456', password: 'Saha2026x', confirmation: 'Saha2026x'
};

const message = (body) => {
  try { validateRegister(body); return null; } catch (e) { return { status: e.statusCode, message: e.message }; }
};

test('une inscription correcte est acceptée', () => {
  assert.equal(message(valide), null);
});

test('tous les champs sont obligatoires', () => {
  for (const champ of Object.keys(valide)) {
    const r = message({ ...valide, [champ]: '' });
    assert.equal(r?.status, 400, `le champ « ${champ} » vide doit être refusé`);
  }
});

test("l'email doit être valide", () => {
  assert.equal(message({ ...valide, email: 'pas-un-email' })?.status, 400);
});

test('le téléphone doit contenir exactement 8 chiffres', () => {
  assert.equal(message({ ...valide, telephone: '1234567' })?.status, 400);
  assert.equal(message({ ...valide, telephone: '2212345a' })?.status, 400);
});

test('le mot de passe exige 8 caractères, une lettre et un chiffre', () => {
  assert.equal(message({ ...valide, password: 'Ab1', confirmation: 'Ab1' })?.status, 400);
  assert.equal(message({ ...valide, password: 'abcdefgh', confirmation: 'abcdefgh' })?.status, 400);
  assert.equal(message({ ...valide, password: '12345678', confirmation: '12345678' })?.status, 400);
});

test('la confirmation doit correspondre au mot de passe', () => {
  const r = message({ ...valide, confirmation: 'Autre2026x' });
  assert.equal(r?.status, 400);
  assert.match(r.message, /confirmation/i);
});
